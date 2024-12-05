import { Button, ButtonGroup, IconButton } from "@mui/material";

import {
    Favorite as LikedIcon,
    FavoriteBorder as LikeIcon,
} from "@mui/icons-material";
import { queryClient, useApp } from "../ThemedApp";
import { useMutation } from "@tanstack/react-query";
import { deleteCommentLike, deletePostLike, postCommentLike, postPostLike } from "../libs/fetcher";
import { useNavigate } from "react-router-dom";

export default function LikeButton({ item, comment }) {
    const { auth } = useApp();
    const navigate = useNavigate();

    function isLiked() {
        if (!auth) return false;
        if (!item.likes) return false;
        return item.likes.find((like) => like.userId == auth.id);
    }

    const likePost = useMutation({
        mutationFn: async (id) => {
            await postPostLike(id);
        },
        onSuccess: () => {
            queryClient.refetchQueries("posts");
            queryClient.refetchQueries("comments");
        },
    });

    const likeComment = useMutation({
        mutationFn: async (id) => {
            await postCommentLike(id);
        },
        onSuccess: () => {
            queryClient.refetchQueries("comments");
        },
    });

    const unlikePost = useMutation({
        mutationFn: async (id) => {
            await deletePostLike(id)
        },
        onSuccess: () => {
            queryClient.refetchQueries("posts");
            queryClient.refetchQueries("comments");
        },
    });
    const unlikeComment = useMutation({
        mutationFn: async (id) => {
            await deleteCommentLike(id);
        },

        onSuccess: () => {
            queryClient.refetchQueries("comments");
        },
    });

    return (
        <ButtonGroup>
            {isLiked() ? (
                <IconButton
                    size="small"
                    onClick={(e) => {
                        comment
                            ? unlikeComment.mutate(item.id)
                            : unlikePost.mutate(item.id);
                        e.stopPropagation();
                    }}
                >
                    <LikedIcon fontSize="small" color="error" />
                </IconButton>
            ) : (
                <IconButton
                    size="small"
                    onClick={(e) => {
                        comment
                            ? likeComment.mutate(item.id)
                            : likePost.mutate(item.id);
                        e.stopPropagation();
                    }}
                >
                    <LikeIcon fontSize="small" color="error" />
                </IconButton>
            )}
            <Button
                onClick={(e) => {
                    if (comment) {
                        navigate(`/likes/${item.id}/comment`);
                    } else {
                        navigate(`/likes/${item.id}/post`);
                    }
                    e.stopPropagation();
                }}
                sx={{ color: "text.fade" }}
                variant="text"
                size="small"
            >
                {item.likes ? item.likes.length : 0}
            </Button>
        </ButtonGroup>
    );
}
