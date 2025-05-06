class Event{
    public _id: any;
    public constructor (
        public name: string,
        public location: string,
        public date: string,
        public setlistIds: any[],
        public isPublic: boolean,
        public creationDate: string
    ) {}

    get getDay(): number {
        const eventDate = new Date(this.date);
        return eventDate.getDate(); 
    }

    get getMonth(): string {
        const eventDate = new Date(this.date);
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[eventDate.getMonth()];
    }

    get getYear(): number {
        const eventDate = new Date(this.date);
        return eventDate.getFullYear();
    }

    get getTime(): string {
        const eventDate = new Date(this.date);
        const hours = eventDate.getHours().toString().padStart(2, '0');
        const minutes = eventDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    get getFullDate(): string {
        return `${this.getMonth} ${this.getDay}, ${this.getYear}, ${this.getTime}`
        
    }
}

export default Event