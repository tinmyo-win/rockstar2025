import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchNotis, putAllNotisRead, putNotiRead } from "../libs/fetcher";
import { queryClient } from "../ThemedApp";
import { Alert, Avatar, Box, Button, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { Comment as CommentIcon, Favorite as FavoriteIcon } from "@mui/icons-material";
import { format } from "date-fns";

export default function Notis() {
    const navigate = useNavigate();
    const { isLoading, isError, error, data } = useQuery({
        queryKey: "notis",
        queryFn: async () => fetchNotis(),

    });
    const readAllNotis = useMutation({
        mutationFn: async () => await putAllNotisRead(),
        onMutate: async () => {
            await queryClient.cancelQueries("notis");
            await queryClient.setQueryData("notis", (old) => {
                return old.map((noti) => {
                    noti.read = true;
                    return noti;
                });
            });
        },
    });
    const readNoti = useMutation({
        mutationFn: async (id) => await putNotiRead(id),
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
            <Box sx={{ display: "flex", mb: 2 }}>
                <Box sx={{ flex: 1 }}></Box>
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 5 }}
                    onClick={() => {
                        readAllNotis.mutate();
                    }}
                >
                    Mark all as read
                </Button>
            </Box>
            {data.map((noti) => {
                return (
                    <Card
                        sx={{ mb: 2, opacity: noti.read ? 0.3 : 1 }}
                        key={noti.id}
                    >
                        <CardActionArea
                            onClick={() => {
                                readNoti.mutate(noti.id);
                                navigate(`/comments/${noti.postId}`);
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: "flex",
                                    opacity: 1,
                                }}
                            >
                                {noti.type == "comment" ? (
                                    <CommentIcon color="success" />
                                ) : (
                                    <FavoriteIcon color="error" />
                                )}
                                <Box sx={{ ml: 3 }}>
                                    <Avatar />
                                    <Box sx={{ mt: 1 }}>
                                        <Typography
                                            component="span"
                                            sx={{ mr: 1 }}
                                        >
                                            <b>{noti.user.name}</b>
                                        </Typography>
                                        <Typography
                                            component="span"
                                            sx={{
                                                mr: 1,
                                                color: "text.secondary",
                                            }}
                                        >
                                            {noti.content}
                                        </Typography>
                                        <Typography
                                            component="span"
                                            color="primary"
                                        >
                                            <small>
                                                {format(
                                                    noti.created,
                                                    "MMM dd, yyyy"
                                                )}
                                            </small>
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                );
            })}
        </Box>
    );
}