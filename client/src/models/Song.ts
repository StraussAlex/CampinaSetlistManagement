class Song {
    public _id: any;
    public constructor(
        public title: string, 
        public artist: string,
        public lyrics: string,
        public notes: string,
        public links: string[],
        public files: SongFile[],
        public creationDate: string
    ) {}
}
class SongFile {
    public constructor(public instrument: string, public filepath: string) {}
}

export { Song, SongFile }