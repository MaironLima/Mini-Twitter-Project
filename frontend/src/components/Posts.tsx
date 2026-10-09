import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  ImageUp,
} from "lucide-react";
import api from "../services/api";
import { useStore } from "../store/store";
import Like from "./Like";

export type Post = {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  authorId: number;
  createdAt: string;
  authorName: string;
  likesCount: number;
};

function Posts() {
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    content: string;
    image?: File | string | null;
  }>({ title: "", content: "", image: null });
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const { currentId, accessToken, searchTerm, setUpdate, update } = useStore();

  useEffect(() => {
    if (
      (currentId === -1 || !accessToken) &&
      (editingPostId !== null || editPreview !== null)
    ) {
      setEditingPostId(null);
      setEditPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, accessToken]);

  const { mutate: deletePost } = useMutation({
    mutationFn: async (postId: number) => {
      await api.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    onSuccess: () => {
      setUpdate();
    },
  });

  const { mutate: editPost } = useMutation({
    mutationFn: async ({
      postId,
      data,
    }: {
      postId: number;
      data: { title: string; content: string; image?: string | null };
    }) => {
      await api.put(`/posts/${postId}`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    },
    onSuccess: () => {
      setEditingPostId(null);
      setEditPreview(null);
      setUpdate();
    },
  });

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch
} = useInfiniteQuery({
  queryKey: ["posts", searchTerm],
  queryFn: async ({ pageParam = 1 }) => {
    const response = await api.get(
      `/posts?page=${pageParam}&search=${searchTerm || ""}`
    );
    return response.data;
  },
  initialPageParam: 1,
  getNextPageParam: (lastPage) => {
    const totalPages = Math.ceil(lastPage.total / lastPage.limit);
    
    if (lastPage.page < totalPages) {
      return lastPage.page + 1;
    }
    
    return undefined;
  },
});

const lastPostRef = useCallback(
  (node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observer.current.observe(node);
  },
  [isFetchingNextPage, hasNextPage, fetchNextPage]
);

useEffect(() => {
  refetch();
}, [update, refetch]);

  function onDelete(postId: number) {
    deletePost(postId);
  }

  function startEdit(post: Post) {
    setEditingPostId(post.id);
    setEditForm({
      title: post.title,
      content: post.content,
      image: post.image,
    });
    setEditPreview(typeof post.image === "string" ? post.image : null);
  }

  function handleEditChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm({ ...editForm, image: file });
      setEditPreview(URL.createObjectURL(file));
    }
  }

  function cancelEdit() {
    setEditingPostId(null);
    setEditPreview(null);
  }

  function submitEdit(postId: number) {
    if (!accessToken || accessToken === "") {
      setEditingPostId(null);
      setEditPreview(null);
      setUpdate();
      return;
    }
    if (editForm.image && editForm.image instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editPost({
          postId,
          data: {
            title: editForm.title,
            content: editForm.content,
            image: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(editForm.image);
    } else {
      editPost({
        postId,
        data: {
          title: editForm.title,
          content: editForm.content,
          image:
            typeof editForm.image === "string" ? editForm.image : undefined,
        },
      });
    }
  }

const sortedPosts = (data?.pages.flatMap(p => p.posts) ?? [])
  .slice()
  .sort((a, b) =>
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
  );

  return (
    <>
    {sortedPosts.map((post, index) => {
      const isLast = index === sortedPosts.length - 1;
      return (
        <div
          key={post.id}
          className="global-card global-alternative-border mt-9 pb-2"
          ref={isLast ? lastPostRef : undefined}
        >
          <div className="flex items-center justify-between pl-0 ml-0 mb-5">
            <div className="flex items-center gap-3">
              <h4 className="global-card-title m-0 pointer-events-none">
                {post.authorName}
              </h4>
              <p className="global-card-extra m-0">
                @{post.authorName} • {post.createdAt}
              </p>
            </div>
            {currentId === post.authorId && (
              <div>
                {editingPostId === post.id ? (
                  <button
                    className="global-post-icon text-[#eb5757] hover:text-[#d94040]"
                    onClick={() => onDelete(post.id)}
                  >
                    <Trash2 />
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(post)}
                    className="global-post-icon hover:text-[#007ed8]"
                  >
                    <Pencil />
                  </button>
                )}
              </div>
            )}
          </div>
          {currentId !== -1 && editingPostId === post.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitEdit(post.id);
              }}
              className="flex flex-col gap-2"
            >
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                className="global-input-placeholder tracking-wider w-full bg-transparent text-xl font-semibold outline-none border-0 border-b global-border mb-2"
                placeholder="Título do post"
                required
              />
              <textarea
                name="content"
                value={editForm.content}
                onChange={handleEditChange}
                rows={3}
                className="w-full bg-transparent global-card-subtitle global-input-placeholder text-lg resize-none outline-none border-none placeholder-word-spacing-tight whitespace-pre-wrap"
                placeholder="E aí, o que está rolando?"
                required
              />
              <div className="flex items-center gap-3">
                <label className="global-post-icon hover:text-[#007ed8] cursor-pointer">
                  <ImageUp size={25} />
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleEditImageChange}
                  />
                </label>
                {currentId !== -1 && editPreview && (
                  <img
                    src={editPreview}
                    alt="preview"
                    className="w-10 h-10 object-cover rounded-md border global-alternative-border"
                  />
                )}

                <div className="flex gap-2 mt-2 justify-end w-full">
                  <button
                    type="button"
                    className="global-alternative-btn px-4 py-2 border global-alternative-border"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="global-btn px-4 py-2">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div className="mt-0">
                <h3 className="global-card-title tracking-wider mb-1 mt-0">
                  {post.title}
                </h3>
                <p className="global-card-subtitle mt-0 whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="flex justify-center w-full">
                {post.image && (
                  <img
                    src={post.image}
                    alt="Posted Image"
                    className="rounded-lg"
                    style={{
                      maxWidth: 700,
                      maxHeight: 700,
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                  />
                )}
              </div>
            </>
          )}

          {!(currentId !== -1 && editingPostId === post.id) && (
            <Like post={post} />
          )}
        </div>
      );
    })}
    <div className="mt-10"></div>
  </>
);
}

export default Posts;
