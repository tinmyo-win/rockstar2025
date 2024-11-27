import { Alert, Box } from "@mui/material";
import Form from "../components/Form";
import Item from "../components/Item";
import { useApp } from "../ThemedApp";
// import { useQuery, useMutation } from "react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../ThemedApp";
import { postPost } from "../libs/fetcher";

export default function Home() {
    const { showForm, setGlobalMsg, auth } = useApp();

    const api = import.meta.env.VITE_API;

    const { isLoading, isError, error, data } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            const res = await fetch(`${api}/content/posts`);
            return res.json();
        },
    });

    const remove = useMutation({
        mutationFn: async (id) => {
            await fetch(`${api}/content/posts/${id}`, {
                method: "DELETE",
            });
        },
        onMutate: (id) => {
            queryClient.setQueriesData(["posts"], (old) =>
                old.filter((item) => item.id !== id)
            );
            setGlobalMsg("A post deleted");
        },
    });

    const add = useMutation({
        mutationFn: (content) => postPost(content),
        onSuccess: async (newPost) => {
            await queryClient.cancelQueries("posts");
            setGlobalMsg("A post added");

            queryClient.setQueryData(["posts"], (oldPosts) => {
                return [newPost, ...oldPosts]; // Add new post to the beginning
            });
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
            {showForm && auth && <Form add={add.mutate} />}
            {data.map((item) => {
                return <Item key={item.id} item={item} remove={remove} />;
            })}
        </Box>
    );
}
