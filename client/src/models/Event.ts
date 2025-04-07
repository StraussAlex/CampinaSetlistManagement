class Event{
    public _id: any;
    public constructor (
        public name: string,
        public place: string,
        public time: string,
        public day: number,
        public month: string,
        public year: number
    ) {}
}

export default Event