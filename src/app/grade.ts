export class Grade {

    display: string;
    evaluative: boolean;
    
    constructor(public value: string, display?: string, evaluative?: boolean, public icon?: string) {
        this.display = display;
        this.evaluative = evaluative;
    }
}
