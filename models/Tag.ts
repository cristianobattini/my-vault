import Realm, { BSON } from "realm";

export class Tag extends Realm.Object {
    _id!: BSON.ObjectId;
    name!: string;
    credentialIds!: BSON.ObjectId[];

    static schema: Realm.ObjectSchema = {
        name: "Tag",
        primaryKey: "_id",
        properties: {
            _id: "objectId",
            name: "string",
            credentialIds: "objectId[]", // Array of ObjectIds referencing credentials
        },
    };

    // Method to add a credential ID to the tag
    addCredential(credentialId: BSON.ObjectId) {
        if (!this.credentialIds.includes(credentialId)) {
            this.credentialIds.push(credentialId);
        }
    }

    // Method to remove a credential ID from the tag
    removeCredential(credentialId: BSON.ObjectId) {
        this.credentialIds = this.credentialIds.filter(id => !id.equals(credentialId));
    }
}