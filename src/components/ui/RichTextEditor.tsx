import { useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Type,
  Palette,
  ChevronDown,
} from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

const fontSizes = [
  { label: "صغير جداً", value: "1", size: "10px" },
  { label: "صغير", value: "2", size: "13px" },
  { label: "عادي", value: "3", size: "16px" },
  { label: "متوسط", value: "4", size: "18px" },
  { label: "كبير", value: "5", size: "24px" },
  { label: "كبير جداً", value: "6", size: "32px" },
  { label: "ضخم", value: "7", size: "48px" },
];

const colors = [
  { label: "أسود", value: "#000000" },
  { label: "رمادي غامق", value: "#4a4a4a" },
  { label: "رمادي", value: "#9ca3af" },
  { label: "أبيض", value: "#ffffff" },
  { label: "أحمر عنابي", value: "#6B1D34" },
  { label: "ذهبي", value: "#C9A227" },
  { label: "أحمر", value: "#ef4444" },
  { label: "أخضر", value: "#22c55e" },
  { label: "أزرق", value: "#3b82f6" },
  { label: "أصفر", value: "#eab308" },
  { label: "برتقالي", value: "#f97316" },
  { label: "بنفسجي", value: "#8b5cf6" },
];

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "ابدأ الكتابة...",
  minHeight = "200px",
  className,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        "h-8 w-8 p-0 hover:bg-muted",
        isActive && "bg-primary/10 text-primary"
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn("border border-border rounded-xl overflow-hidden bg-muted/50", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 border-l border-border pl-2 ml-2">
          <ToolbarButton onClick={() => execCommand("bold")} title="عريض">
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("italic")} title="مائل">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("underline")} title="تحته خط">
            <Underline className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Font Size */}
        <div className="border-l border-border pl-2 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                <Type className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-card border-border">
              {fontSizes.map((size) => (
                <DropdownMenuItem
                  key={size.value}
                  onClick={() => execCommand("fontSize", size.value)}
                  className="cursor-pointer"
                >
                  <span style={{ fontSize: size.size }}>{size.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Text Color */}
        <div className="border-l border-border pl-2 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                <Palette className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-card border-border">
              <div className="grid grid-cols-4 gap-1 p-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => execCommand("foreColor", color.value)}
                    className="w-8 h-8 rounded-md border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-l border-border pl-2 ml-2">
          <ToolbarButton onClick={() => execCommand("justifyRight")} title="محاذاة لليمين">
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("justifyCenter")} title="توسيط">
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("justifyLeft")} title="محاذاة لليسار">
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="قائمة نقطية">
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="قائمة مرقمة">
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        dir="rtl"
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
        className={cn(
          "p-4 outline-none prose prose-sm max-w-none text-foreground",
          !value && !isFocused && "text-muted-foreground",
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

      {/* CSS for placeholder */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
