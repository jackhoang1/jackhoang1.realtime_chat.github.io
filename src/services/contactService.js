import ContactModel from "./../models/contactModel";
import UserModel from "./../models/userModel";
import NotificationModel from "./../models/notificationModel";
import _ from "lodash";

const LIMIT_NUMBER_TAKEN= 10;

let findUsersContact = (currentUserId, keyword) => {
  return new Promise( async (resolve, reject) => {
    let deprecatedUserIds = [currentUserId];
    let contactsByUser = await ContactModel.findAllByUser(currentUserId);
    contactsByUser.forEach((contact) => {
      deprecatedUserIds.push(contact.userId);
      deprecatedUserIds.push(contact.contactId);
    });
    

    deprecatedUserIds = _.uniqBy(deprecatedUserIds);
    let users = await UserModel.findAllForAddContact(deprecatedUserIds, keyword);
    resolve(users);

  });
};

let addNew = (currentUserId, contactId) => {
  return new Promise( async (resolve, reject) => {
    let contactExists = await ContactModel.checkExists(currentUserId, contactId);
    if (contactExists) {
      return reject(false);
    }
    // create contact
    let newContactItem = {
      userId: currentUserId,
      contactId: contactId
    };

    let newContact = await ContactModel.createNew(newContactItem);

    //create notification
    let notificationItem = {
      senderId: currentUserId,
      receiverId: contactId,
      type: NotificationModel.types.ADD_CONTACT
    };
    await NotificationModel.model.createNew(notificationItem);
  
    resolve(newContact);
  });
};

let removeContact= (currentUserId, contactId) => {
  return new Promise( async (resolve, reject) => {
    let removeContact = await ContactModel.removeContact(currentUserId, contactId);
    if (removeContact.result.n ===0) {
      return reject(false);
    }
    resolve(true);
  });
}

let removeRequestContactSent = (currentUserId, contactId) => {
  return new Promise( async (resolve, reject) => {
    let removeReq = await ContactModel.removeRequestContactSent(currentUserId, contactId);
    if (removeReq.result.n ===0) {
      return reject(false);
    }
    //remove notification
    let notifTypeAddContact = NotificationModel.types.ADD_CONTACT;
    await NotificationModel.model.removeRequestContactSentNotification(currentUserId, contactId, notifTypeAddContact);

    resolve(true);
  });
};

let removeRequestContactReceived = (currentUserId, contactId) => {
  return new Promise( async (resolve, reject) => {
    let removeReq = await ContactModel.removeRequestContactReceived(currentUserId, contactId);
    if (removeReq.result.n ===0) {
      return reject(false);
    }
    // //remove notification
    // let notifTypeAddContact = NotificationModel.types.ADD_CONTACT;
    // await NotificationModel.model.removeRequestContactReceivedNotification(currentUserId, contactId, notifTypeAddContact);
    resolve(true);
  });
};

let approveRequestContactReceived = (currentUserId, contactId) => {
  return new Promise( async (resolve, reject) => {
    let approveReq = await ContactModel.approveRequestContactReceived(currentUserId, contactId);
    if (approveReq.nModified ===0) {
      return reject(false);
    }
    // create notification
    let notificationItem = {
      senderId: currentUserId,
      receiverId: contactId,
      type: NotificationModel.types.APPROVE_CONTACT
    };
    await NotificationModel.model.createNew(notificationItem);
  
    resolve(true);
  });
};

let getContacts = (currentUserId) => {
  return new Promise( async (resolve, reject) => {
    try {
      let contacts = await ContactModel.getContacts(currentUserId, LIMIT_NUMBER_TAKEN);
      let users = contacts.map( async (contact) => {
        if (contact.contactId == currentUserId) {
          return await UserModel.getNormalUserDataById(contact.userId);
        } else {
          return await UserModel.getNormalUserDataById(contact.contactId);
        }
      });

      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let getContactsSent = (currentUserId) => {
  return new Promise( async (resolve, reject) => {
    try {
      let contacts = await ContactModel.getContactsSent(currentUserId, LIMIT_NUMBER_TAKEN);
      let users = contacts.map( async (contact) => {
        return await UserModel.getNormalUserDataById(contact.contactId);
      });

      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let getContactsReceived = (currentUserId) => {
  return new Promise( async (resolve, reject) => {
    try {
      let contacts = await ContactModel.getContactsReceived(currentUserId, LIMIT_NUMBER_TAKEN);
      let users = contacts.map( async (contact) => {
        return await UserModel.getNormalUserDataById(contact.userId);
      });

      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let countAllContacts = (currentUserId) => {
  return new Promise( async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContacts(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

let countAllContactsSent = (currentUserId) => {
  return new Promise( async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContactsSent(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

let countAllContactsReceived = (currentUserId) => {
  return new Promise( async (resolve, reject) => {
    try {
      let count = await ContactModel.countAllContactsReceived(currentUserId);
      resolve(count);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Read more contact, max 10 item one time
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
let readMoreContacts = (currentUserId, skipNumberContacts) => {
  return new Promise ( async (resolve, reject) => {
    try {
      let newContacts = await ContactModel.readMoreContacts(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

      let users = newContacts.map( async (contact) => {
        if (contact.contactId == currentUserId) {
          return await UserModel.getNormalUserDataById(contact.userId);
        } else {
          return await UserModel.getNormalUserDataById(contact.contactId);
        }
      });

      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Read more contact sent, max 10 item one time
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
let readMoreContactsSent = (currentUserId, skipNumberContacts) => {
  return new Promise ( async (resolve, reject) => {
    try {
      let newContacts = await ContactModel.readMoreContactsSent(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

      let users = newContacts.map( async (contact) => {
        return await UserModel.getNormalUserDataById(contact.contactId);
      });

      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Read more contact received, max 10 item one time
 * @param {string} currentUserId 
 * @param {number} skipNumberContacts 
 */
let readMoreContactsReceived = (currentUserId, skipNumberContacts) => {
  return new Promise ( async (resolve, reject) => {
    try {
      let newContacts = await ContactModel.readMoreContactsReceived(currentUserId, skipNumberContacts, LIMIT_NUMBER_TAKEN);

      let users = newContacts.map( async (contact) => {
        return await UserModel.getNormalUserDataById(contact.userId);
      });

      resolve(await Promise.all(users));
    } catch (error) {
      reject(error);
    }
  });
};

let searchFriends = (currentUserId, keyword) => {
  return new Promise( async (resolve, reject) => {
    let frienIds = [];
    let friens = await ContactModel.getFriends(currentUserId);

    friens.forEach((item) => {
      frienIds.push(item.userId);
      frienIds.push(item.contactId);
    });

    frienIds = _.uniqBy(frienIds);
    frienIds = frienIds.filter(userId => userId != currentUserId);

    let users = await UserModel.findAllToAddGroupChat(frienIds, keyword);

    resolve(users);

  });
};

module.exports = {
findUsersContact: findUsersContact,
addNew: addNew,
removeContact: removeContact,
removeRequestContactSent: removeRequestContactSent,
removeRequestContactReceived: removeRequestContactReceived,
approveRequestContactReceived: approveRequestContactReceived,
getContacts: getContacts,
getContactsSent: getContactsSent,
getContactsReceived: getContactsReceived,
countAllContacts: countAllContacts,
countAllContactsSent: countAllContactsSent,
countAllContactsReceived: countAllContactsReceived,
readMoreContacts: readMoreContacts,
readMoreContactsSent: readMoreContactsSent,
readMoreContactsReceived: readMoreContactsReceived,
searchFriends: searchFriends
};
