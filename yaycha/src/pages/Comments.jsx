import { Alert, Box, Button, TextField } from "@mui/material";
import Item from "../components/Item";
import { useNavigate, useParams } from "react-router-dom";
import { queryClient, useApp } from "../ThemedApp";
// import { useMutation, useQuery } from "react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getToken, postComment } from "../libs/fetcher";
import { useRef } from "react";

const api = import.meta.env.VITE_API;
export default function Comments() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setGlobalMsg, auth } = useApp();
    const contentInput = useRef();

    const { isLoading, isError, error, data } = useQuery({
        queryKey: ["comments"],
        queryFn: async () => {
            const res = await fetch(`${api}/content/posts/${id}`);
            return res.json();
        },
    });

    const removePost = useMutation({
        mutationFn: async (id) => {
            await fetch(`${api}/content/posts/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            navigate("/");
            setGlobalMsg("A post deleted");
        },
    });

    const removeComment = useMutation({
        mutationFn: async (id) => {
            const token = getToken();
            await fetch(`${api}/content/comments/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["comments"] });
            queryClient.setQueryData(["comments"], (old) => {
                return {
                    ...old,
                    comments: old.comments.filter(
                        (comment) => comment.id !== id
                    ),
                };
            });
            setGlobalMsg("A comment deleted");
        },
    });

    const addComment = useMutation({
        mutationFn: async ({ content, postId }) => postComment(content, postId),
        onSuccess: async (comment) => {
            console.log("comment added", comment);
            await queryClient.cancelQueries("comments");
            queryClient.setQueryData(["comments"], (old) => {
                old.comments = [...old.comments, comment];
                return { ...old };
            });
            setGlobalMsg("A comment added");
        },
    });

    if (isError) {
        return (
            <Box>
                <Alert severity="warning">{error.message}</Alert>
            </Box>
        );
    }
    if (isLoading) {
        return <Box sx={{ textAlign: "center" }}>Loading...</Box>;
    }

    return (
        <Box>
            <Item primary item={data} remove={removePost.mutate} />

            {data.comments.map((comment) => {
                return (
                    <Item
                        comment
                        key={comment.id}
                        item={comment}
                        remove={removeComment.mutate}
                    />
                );
            })}

            {auth && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const content = contentInput.current.value;
                        if (!content) return false;
                        addComment.mutate({content, postId: data.id});
                        e.currentTarget.reset();
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            mt: 3,
                        }}
                    >
                        <TextField
                            inputRef={contentInput}
                            multiline
                            placeholder="Your Comment"
                        />
                        <Button type="submit" variant="contained">
                            Reply
                        </Button>
                    </Box>
                </form>
            )}
        </Box>
    );
}
