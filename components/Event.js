

class Event extends Component{
    const [host, setHost];
    const [title, setTitle];
    
    constructor(props) {
        super(props);

    }

    createEvent(host, title) {
        this.host = host;
        this.title = title;
    }

    
}