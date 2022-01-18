
const securesGenerate = () => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).replace(/\W+/, '').substr(0, 16);
}

const weakGenerate = () => btoa(Math.random().toString(36).substring(2)).replace(/\W+/, '');

export default class Random {
    static string(len = 16) {
        const generate = window.crypto ? securesGenerate : weakGenerate;

        let result = "";
        while (result < len) {
            result += generate();
        }

        return result.substring(0, len);
    }

    static element(items) {
        const bytes = new Uint32Array(1);
        const index = crypto.getRandomValues(bytes)[0] % items.length;
        return items[index];
    }
}
