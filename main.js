class LocalStorage {
    static get(key, props = {}) {
        if (props === true) props = { withOptions: true };

        const keyName = props.local ? `${key}[${window.location.pathname}]` : key;

        let data = localStorage.getItem(keyName);
        if (!data) return props.default !== undefined ? props.default : undefined;

        try {
            data = JSON.parse(data);
        } catch (error) {
            return null;
        }

        let value = props.withOptions ? data : data.value;

        if (props.lifetime) {
            const currentDate = Math.floor(new Date() / 1000);
            const valueDate = data.update || data.create;
            if (currentDate - valueDate > props.lifetime) value = undefined;
        }

        return value === undefined && props.default !== undefined ? props.default : value;
    }

    static set(key, value, props = {}) {
        const keyName = props.local ? `${key}[${window.location.pathname}]` : key;

        const data = this.get(keyName, true);
        const time = Math.floor(new Date().getTime() / 1000);

        localStorage.setItem(keyName, JSON.stringify({
            create: data ? data.create : time,
            update: data ? time : null,
            value: value
        }));

        return value;
    }
}

class DaysWithoutBugs {
    constructor() {
        this.flipdown = document.getElementById('flipdown')

        this.counter = document.getElementById('counter')
        this.resetButton = document.getElementById('reset')
        this.errorsLabel = document.getElementById('errors')

        this.fields = {}

        this.data = LocalStorage.get('data')

        if (!this.data) LocalStorage.set('data', {
            date: moment().unix(),
            errors: 0
        })

        this.reset = this.reset.bind(this)
        this.start = this.start.bind(this)

        if (this.resetButton) this.resetButton.addEventListener('click', () => { this.reset() })

        this.start()
    }

    start() {
        FlipClock.Lang.Custom = { days: 'Дней', hours: 'Часов', minutes: 'Минут', seconds: 'Секунд' }

        this.clock = $('#flipdown').FlipClock({
            clockFace: 'DailyCounter',
            autoStart: false,
            language : 'Custom'
        })

        console.log(moment().unix() - moment(this.data.date * 1000).unix())

        this.clock.setTime(moment().unix() - moment(this.data.date * 1000).unix())

        this.clock.start()

        this.errorsLabel.innerText = this.data.errors
    }

    reset() {
        this.data = LocalStorage.set('data', {
            date: moment().unix(),
            errors: this.data.errors + 1
        })

        this.errorsLabel.innerText = this.data.errors

        this.clock.setTime(moment().unix() - moment(this.data.date * 1000).unix())
    }
}

window.addEventListener('load', async () => {
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js')
            console.log('Service worker register success', reg)
        } catch (e) {
            console.log('Service worker register fail')
        }
    }
})

document.addEventListener("DOMContentLoaded", function () {
    window.daysWithoutBugs = new DaysWithoutBugs()
})
