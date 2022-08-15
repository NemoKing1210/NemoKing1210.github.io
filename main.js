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
        this.counter = document.getElementById('counter')
        this.resetButton = document.getElementById('reset')

        this.startDate = LocalStorage.get('start-date')

        if (!this.startDate) LocalStorage.set('start-date', moment().format('YYYY-MM-DD'))

        this.update = this.update.bind(this)
        this.reset = this.reset.bind(this)

        if (this.resetButton) this.resetButton.addEventListener('click', () => { this.reset() })
        document.addEventListener('focus', () => { this.update() })

        setInterval(() => {
            this.update()
        }, 60000)

        this.update()
    }

    update() {
        const diff = moment().diff(moment(this.startDate), 'days')

        this.counter.innerHTML = diff
    }

    reset() {
        this.startDate = LocalStorage.set('start-date', moment().format('YYYY-MM-DD'))
        this.update()
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
