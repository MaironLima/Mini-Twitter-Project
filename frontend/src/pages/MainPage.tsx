import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ImageUp } from "lucide-react";
import Posts from "../components/Posts";
import { useMutation } from "@tanstack/react-query";
import api from "../services/api";
import { useStore } from "../store/store";

type FormData = {
  title: string;
  content: string;
  image?: File;
};

function MainPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const { accessToken, setUpdate } = useStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  function handleClick() {
    fileInputRef.current?.click();
  }

  const { mutate: sendPost } = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      image?: string;
    }) => {
      const response = await api.post("/posts", data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      setUpdate();
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const maxSize = 5 * 1024 * 1024;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      alert("Apenas PNG ou JPEG");
      return;
    }

    if (file.size > maxSize) {
      alert("Máximo 5MB");
      return;
    }

    setValue("image", file);
    setPreview(URL.createObjectURL(file));
  }

  function onSubmit(data: FormData) {
    if (!accessToken) {
      setPostError("Você precisa estar logado para postar.");
      return;
    }
    setPostError(null);

    if (data.image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendPost({
          title: data.title,
          content: data.content,
          image: reader.result as string, // base64 string
        });
        reset();
        setPreview(null);
      };
      reader.readAsDataURL(data.image);
    } else {
      sendPost({
        title: data.title,
        content: data.content,
        image: undefined,
      });
      reset();
      setPreview(null);
    }
  }

  return (
    <div className="w-[700px] mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="global-card global-alternative-border"
      >
        <input
          type="text"
          placeholder="Título do post"
          {...register("title", { required: "Digite um título" })}
          className="global-input-placeholder  tracking-wider w-full bg-transparent text-xl font-semibold outline-none border-0 border-b global-border mb-2"
        />

        {errors.title && (
          <p className="text-red-500 text-sm mb-1">{errors.title.message}</p>
        )}

        <textarea
          placeholder="E aí, o que está rolando?"
          rows={3}
          {...register("content", { required: "Digite algo antes de postar" })}
          className="w-full bg-transparent global-card-subtitle global-input-placeholder text-lg resize-none outline-none border-none placeholder-word-spacing-tight"
        />

        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}

        <div className="global-post-line w-full h-px my-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClick}
              className="global-post-icon hover:text-[#007ed8]"
            >
              <ImageUp size={25} />
            </button>

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-10 h-10 object-cover rounded-md border global-alternative-border"
              />
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={handleFileChange}
          />

          {postError && (
            <p className="text-red-500 text-sm mb-1">{postError}</p>
          )}
          <button type="submit" className="global-btn px-6 py-2">
            Postar
          </button>
        </div>
      </form>

      <Posts />
    </div>
  );
}

export default MainPage;
