class Song {
    public _id: any;
    public constructor(
        public title: string, 
        public artist: string,
        public lyrics: string,
        public links: string[],
        public files: SongFile[]
    ) {}
}
class SongFile {
    public constructor(public instrument: string, public filepath: string) {}
}

export { Song, SongFile }