export default class Song {
    public constructor(private _title: string, private _artist: string) {}

    public get title(): string { return this._title; }
    public set title(t: string) { this._title = t; }

    public get artist(): string { return this._artist; }
    public set artist(a: string) { this._artist = a; }
}