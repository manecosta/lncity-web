export namespace Utils {
    export class Objects {
        static keys(object: Object): Array<any> {
            const keysList = [];

            if ('keys' in Object) {
                return Object.keys(object);
            }

            for (const k in object) {
                if (object.hasOwnProperty(k)) {
                    keysList.push(k);
                }
            }

            return keysList;
        }
    }

    export function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
