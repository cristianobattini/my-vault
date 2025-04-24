import Realm, { BSON } from "realm";

export class Credential extends Realm.Object {
    _id!: BSON.ObjectId;
    title!: string;
    username!: string;
    password!: string;
    url!: string;
    notes!: string;
    createdAt!: Date;
    updatedAt!: Date;
    isFavorite!: boolean;
    isArchived!: boolean;

    static schema: Realm.ObjectSchema = {
        name: "Credential",
        primaryKey: "_id",
        properties: {
            _id: "objectId",
            title: "string",
            username: "string",
            password: "string",
            url: "string",
            notes: "string",
            createdAt: "date",
            updatedAt: "date",
            isFavorite: "bool",
            isArchived: "bool",
        },
    };

    // Method to toggle favorite status
    toggleFavorite(realm: Realm) {
        realm.write(() => {
            this.isFavorite = !this.isFavorite;
        });
    }

    // Method to archive the credential
    archive(realm: Realm) {
        realm.write(() => {
            this.isArchived = true;
        });
    }

    // Method to unarchive the credential
    unarchive(realm: Realm) {
        realm.write(() => {
            this.isArchived = false;
        });
    }
}