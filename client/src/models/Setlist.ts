class Setlist {
    public _id: any;
    constructor(public name: string, public songs: SetlistSong[], public creationDate: string) {}
}

class SetlistSong {
    constructor(public songId: any, public position: number) {}
}

export { Setlist, SetlistSong }