import multer from "multer";
import { createStorage} from "../config/cloudinaryStorage.js";

//upload audio files
export const uploadUserImage = multer({storage: createStorage("users")});
export const uploadTrackCover = multer({storage: createStorage("tracks_covers")});
export const uploadAlbumCover = multer({storage: createStorage("albums_covers")});
export const uploadPlaylistCover = multer({storage: createStorage("playlists_covers")});

//Audio
export const uploadSong = multer({storage: createStorage("tracks", "video")});