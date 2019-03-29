export abstract class Model {
    abstract mapping(): { [key: string]: any };

    clone(ModelClass) {
        return new ModelClass(this.serializable());
    }

    stringify() {
        return JSON.stringify(this.serializable());
    }

    serializable(): object {
        const serializable: { [key: string]: any } = {};
        const mapping = this.mapping();

        for (const key in mapping) {
            if (mapping.hasOwnProperty(key)) {
                const value = mapping[key];

                if (value instanceof Array) {
                    const objectField = value[0];

                    const objectProperty = this[objectField];

                    if (objectProperty) {
                        const result = this.serializableObject(objectProperty);
                        if (result) {
                            serializable[key] = result;
                        }
                    }
                } else if (typeof value === 'string') {
                    if (this.hasOwnProperty(value)) {
                        serializable[key] = this[value];
                    }
                } else {
                    console.warn(
                        'Provided wrong type for mapping value:',
                        value
                    );
                }
            }
        }

        return serializable;
    }

    serializableObject(obj): object {
        if (obj instanceof Array) {
            const serializedObjects = [];
            for (const element of obj) {
                const serializedObject = this.serializableObject(element);
                if (serializedObject) {
                    serializedObjects.push(serializedObject);
                }
            }
            return serializedObjects;
        } else if (obj instanceof Object && !(obj instanceof Model)) {
            const serializedMap = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const element = obj[key];
                    serializedMap[key] = this.serializableObject(element);
                }
            }
            return serializedMap;
        } else if (obj instanceof Model) {
            return obj.serializable();
        }
        return obj;
    }

    constructor(jsonObject?: Object) {
        if (!jsonObject) {
            jsonObject = {};
        }

        const mapping = this.mapping();

        for (const key in mapping) {
            if (mapping.hasOwnProperty(key)) {
                const element = mapping[key];

                if (element instanceof Array) {
                    const objectField = element[0];
                    const ObjectModel = element[1];
                    const providedObject = jsonObject[key];

                    if (providedObject) {
                        try {
                            if (providedObject instanceof Array) {
                                const objects = [];
                                for (const singleProvidedObject of providedObject) {
                                    objects.push(
                                        new ObjectModel(singleProvidedObject)
                                    );
                                }
                                this[objectField] = objects;
                            } else {
                                if (providedObject) {
                                    this[objectField] = new ObjectModel(
                                        providedObject
                                    );
                                } else {
                                    this[objectField] = undefined;
                                }
                            }
                        } catch (e) {
                            console.error(e, objectField);
                        }
                    }
                } else if (typeof element === 'string') {
                    const providedObject = jsonObject[key];

                    if (providedObject != null) {
                        this[element] = providedObject;
                    }
                } else {
                    console.warn(
                        'Provided wrong type for mapping value:',
                        element
                    );
                }
            }
        }
    }
}
