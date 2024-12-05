import { Button } from "@mui/material";
import { queryClient, useApp } from "../ThemedApp";
import { deleteFollow, postFollow } from "../libs/fetcher";
import { useMutation } from "@tanstack/react-query";

export default function FollowButton({ user }) {
    const { auth } = useApp();

    function isFollowing() {
        return user.following.find((item) => item.followerId == auth.id);
    }
    const follow = useMutation(
        {
            mutationFn: async(id) => await postFollow(id),
            onSuccess: async () => {
                await queryClient.refetchQueries("users");
                await queryClient.refetchQueries("user");
                await queryClient.refetchQueries("search");
            },
        }
    );
    const unfollow = useMutation(
        {
            mutationFn: async (id) => await deleteFollow(id),
            onSuccess: async () => {
                await queryClient.refetchQueries("users");
                await queryClient.refetchQueries("user");
                await queryClient.refetchQueries("search");
            },
        }
    );
    return auth?.id && auth?.id === user?.id ? (
        <></>
    ) : (
        <Button
            size="small"
            edge="end"
            variant={isFollowing() ? "outlined" : "contained"}
            sx={{ borderRadius: 5 }}
            onClick={(e) => {
                if (isFollowing()) {
                    unfollow.mutate(user.id);
                } else {
                    follow.mutate(user.id);
                }
                e.stopPropagation();
            }}
        >
            {isFollowing() ? "Following" : "Follow"}
        </Button>
    );
}
