import { useMutation } from "@tanstack/react-query";
import { useStore } from "../store/store";
import { useState } from "react";
import api from "../services/api";
import { Heart, HeartMinus, HeartPlus } from "lucide-react";
import type { Post } from "./Posts";

type LikeProps = {
  post: Post;
};

function Like({ post }: LikeProps) {
  const { accessToken, currentId, likedPosts, setPostLiked } = useStore();
  const isLiked = likedPosts[post.id] ?? false;

  const [liked, setLiked] = useState<boolean>(isLiked);
  const [likes, setLikes] = useState<number>(post.likesCount);
  const [likeError, setLikeError] = useState<boolean>(false);

    

  const { mutate: likeMutation } = useMutation({
    mutationFn: async (postId: number) => {
      const response = await api.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setPostLiked(post.id, data.liked);
      if (typeof data.likesCount === 'number') {
        setLikes(data.likesCount);
      } else {
        setLikes((prev) => data.liked ? prev + 1 : prev - 1);
      }
    },
  });

  function handleLike() {
    if (!accessToken) {
      setLikeError(true);
      return;
    }
    setLikeError(false);
    likeMutation(post.id);
  }

  return (
    <div className="bg-none mb-0 mt-4 flex items-center gap-2">
      <button
        className={
          currentId === post.authorId
            ? "global-like mb-0 pointer-events-none"
            : liked && !!accessToken
              ? "global-like mb-0 group"
              : "global-like-unactived mb-0 group"
        }
        onClick={currentId === post.authorId ? undefined : handleLike}
        tabIndex={currentId === post.authorId ? -1 : 0}
        aria-disabled={currentId === post.authorId}
      >
        <span className="block group-hover:hidden">
          <Heart />
        </span>
        {currentId === post.authorId ? (
          <span className="hidden group-hover:block">
            <HeartMinus />
          </span>
        ) : !(liked && !!accessToken) ? (
          <span className="hidden group-hover:block">
            <HeartPlus />
          </span>
        ) : (
          <span className="hidden group-hover:block">
            <HeartMinus />
          </span>
        )}
      </button>
      <span
        className={
          (currentId === post.authorId ? "pointer-events-none " : "") +
          (currentId === post.authorId || (liked && !!accessToken)
            ? "global-like mb-0 -translate-x-2 -translate-y-px"
            : "global-like-unactived mb-0 -translate-x-2 -translate-y-px")
        }
      >
        {likes}
      </span>
      {likeError && (
        <p className="text-red-500 text-sm mt-2 ml-1">
          Você precisa estar logado para curtir.
        </p>
      )}
    </div>
  );
}

export default Like;
