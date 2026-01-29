import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create regular client for auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...data } = await req.json();

    switch (action) {
      case "list": {
        // Get all users from auth
        const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        // Get profiles and roles
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id, username, full_name, avatar_url");

        const { data: roles } = await supabaseAdmin
          .from("user_roles")
          .select("user_id, role");

        // Merge data
        const users = authUsers.users.map((authUser) => {
          const profile = profiles?.find((p) => p.user_id === authUser.id);
          const userRole = roles?.find((r) => r.user_id === authUser.id);
          return {
            id: authUser.id,
            email: authUser.email,
            username: profile?.username || null,
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            role: userRole?.role || "editor",
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at,
            email_confirmed_at: authUser.email_confirmed_at,
            is_banned: !!(authUser as any).banned_until,
          };
        });

        return new Response(JSON.stringify({ users }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create": {
        const { email, password, username, full_name, role } = data;

        if (!email || !password || !username) {
          return new Response(
            JSON.stringify({ error: "Email, password, and username are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Create user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createError) throw createError;

        // Create profile
        await supabaseAdmin.from("profiles").insert({
          user_id: newUser.user.id,
          username,
          full_name: full_name || null,
        });

        // Assign role
        await supabaseAdmin.from("user_roles").insert({
          user_id: newUser.user.id,
          role: role || "editor",
        });

        return new Response(
          JSON.stringify({ success: true, user_id: newUser.user.id }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "update": {
        const { user_id, email, username, full_name, role } = data;

        if (!user_id) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update auth email if provided
        if (email) {
          await supabaseAdmin.auth.admin.updateUserById(user_id, { email });
        }

        // Update profile
        if (username || full_name !== undefined) {
          const profileUpdate: Record<string, string | null> = {};
          if (username) profileUpdate.username = username;
          if (full_name !== undefined) profileUpdate.full_name = full_name;

          await supabaseAdmin
            .from("profiles")
            .update(profileUpdate)
            .eq("user_id", user_id);
        }

        // Update role
        if (role) {
          await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id, role }, { onConflict: "user_id" });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const { user_id } = data;

        if (!user_id) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Prevent self-deletion
        if (user_id === user.id) {
          return new Response(
            JSON.stringify({ error: "Cannot delete your own account" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Delete user (cascades to profiles and roles)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "toggle_ban": {
        const { user_id, ban } = data;

        if (!user_id) {
          return new Response(JSON.stringify({ error: "User ID is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Prevent self-ban
        if (user_id === user.id) {
          return new Response(
            JSON.stringify({ error: "Cannot ban your own account" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (ban) {
          // Ban for 100 years (effectively permanent)
          const banUntil = new Date();
          banUntil.setFullYear(banUntil.getFullYear() + 100);
          await supabaseAdmin.auth.admin.updateUserById(user_id, {
            ban_duration: "87600h", // 10 years in hours
          });
        } else {
          // Unban
          await supabaseAdmin.auth.admin.updateUserById(user_id, {
            ban_duration: "none",
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reset_password": {
        const { user_id, new_password } = data;

        if (!user_id || !new_password) {
          return new Response(
            JSON.stringify({ error: "User ID and new password are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        await supabaseAdmin.auth.admin.updateUserById(user_id, {
          password: new_password,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
