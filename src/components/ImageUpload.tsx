import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/utils/imageUtils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  maxSize?: number; // In MB
}

const ImageUpload = ({ value, onChange, folder = "general", maxSize = 10 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة فقط");
      return;
    }

    setUploading(true);
    
    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file);
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      const { error } = await supabase.storage.from("images").upload(fileName, compressedBlob, {
        contentType: "image/jpeg"
      });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      onChange(urlData.publicUrl);
      toast.success("تم رفع الصورة وضغطها بنجاح");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("فشل رفع الصورة أو ضغطها");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-secondary/30">
          <img src={value} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Upload className="w-3.5 h-3.5 ml-1" /> تغيير
            </Button>
            <Button type="button" size="sm" variant="destructive" onClick={() => onChange("")}>
              <X className="w-3.5 h-3.5 ml-1" /> حذف
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <span className="font-cairo text-sm text-muted-foreground">اضغط لرفع صورة</span>
              <span className="font-cairo text-xs text-muted-foreground/60">PNG, JPG حتى 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
