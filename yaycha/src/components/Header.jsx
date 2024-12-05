import { useApp } from "../ThemedApp";
import { Box, AppBar, Toolbar, Typography, IconButton, Badge } from "@mui/material";
import {
    Menu as MenuIcon,
    Add as AddIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    Search as SearchIcon,
    Notifications as NotiIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchNotis } from "../libs/fetcher";

export default function Header() {
    const { auth, showForm, setShowForm, mode, setMode, setShowDrawer } =
        useApp();

    const navigate = useNavigate();

    const { isLoading, isError, data } = useQuery({
        queryKey: ["notis", auth],
        queryFn: async () => fetchNotis(auth),
    });

    function notiCount() {
        if (!auth) return 0;
        if (isLoading || isError) return 0;
        return data.filter((noti) => !noti.read).length;
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    onClick={() => setShowDrawer(true)}
                    color="inherit"
                    edge="start"
                >
                    <MenuIcon />
                </IconButton>
                <Typography sx={{ flexGrow: 1, ml: 2 }}>Yaycha</Typography>
                <Box>
                    <IconButton
                        color="inherit"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <AddIcon />
                    </IconButton>

                    <IconButton
                        color="inherit"
                        onClick={() => navigate("/search")}
                    >
                        <SearchIcon />
                    </IconButton>

                    {auth && (
                        <IconButton
                            color="inherit"
                            onClick={() => navigate("/notis")}
                        >
                            <Badge color="error" badgeContent={notiCount()}>
                                <NotiIcon />
                            </Badge>
                        </IconButton>
                    )}

                    {mode === "dark" ? (
                        <IconButton
                            color="inherit"
                            edge="end"
                            onClick={() => setMode("light")}
                        >
                            <LightModeIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            color="inherit"
                            edge="end"
                            onClick={() => setMode("dark")}
                        >
                            <DarkModeIcon />
                        </IconButton>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
