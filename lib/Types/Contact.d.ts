"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactAction = exports.Contact = void 0;

export interface Contact {
    /** ID either in lid or jid format */
    id: string;
    /** ID in Lid (anonymous) format (@lid) */
    lid?: string;
    /** ID in Phone Number format (@s.whatsapp.net) */
    jid?: string;
    /** name of the contact, you have saved on your WA */
    name?: string;
    /** name of the contact, the contact has set on their own on WA */
    notify?: string;
    /** I have no idea */
    verifiedName?: string;
    /**
     * Url of the profile picture of the contact
     *
     * 'changed' => if the profile picture has changed
     * null => if the profile picture has not been set (default profile picture)
     * any other string => url of the profile picture
     */
    imgUrl?: string | null;
    status?: string;
}

const Contact = {
    /** ID either in lid or jid format */
    id: '',
    /** ID in Lid (anonymous) format (@lid) */
    lid: undefined,
    /** ID in Phone Number format (@s.whatsapp.net) */
    jid: undefined,
    /** name of the contact, you have saved on your WA */
    name: undefined,
    /** name of the contact, the contact has set on their own on WA */
    notify: undefined,
    /** I have no idea */
    verifiedName: undefined,
    /**
     * Url of the profile picture of the contact
     *
     * 'changed' => if the profile picture has changed
     * null => if the profile picture has not been set (default profile picture)
     * any other string => url of the profile picture
     */
    imgUrl: undefined,
    status: undefined
};
exports.Contact = Contact;

export interface ContactAction {
    firstName: string;
    fullName: string;
    saveOnPrimaryAddressbook: boolean;
}

const ContactAction = {
    firstName: '',
    fullName: '',
    saveOnPrimaryAddressbook: false
};
exports.ContactAction = ContactAction;
