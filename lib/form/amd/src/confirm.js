// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Form confirmation module.
 *
 * @module     core_form/confirm
 * @copyright  2022 Matt Porritt <mattp@catalyst-au.net>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Notification from 'core/notification';
import ModalFactory from 'core/modal_factory';
import ModalEvents from 'core/modal_events';
import Str from 'core/str';
import Templates from 'core/templates';

/**
 * Module level variables.
 */
let modalObj;

// TODO: throw this in a core template and raise a tracker to fix across core.
const spinner = '<p class="text-center">'
    + '<i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>'
    + '</p>';

/**
 * Creates the confirmation modal.
 *
 * @private
 */
const createModal = () => {
// Get the Title String.
    Str.get_string('loading').then(function(title) {
        // Create the Modal.
        ModalFactory.create({
            type: ModalFactory.types.DEFAULT,
            title: title,
            body: spinner,
            large: true
        }).done(function(modal) {
            modalObj = modal;
        });
        return;
    }).catch(function() {
        Notification.exception(new Error('Failed to load string: loading'));
    });
};

/**
 * Updates the modal with content.
 *
 * @param {Object} form The HTML form that has confirmation fields.
 * @param {Array} confirmNotices The notice information.
 * @private
 */
function updateModal(form, confirmNotices) {
    modalObj.setBody(spinner);
    modalObj.show();
    Str.get_string('copycoursetitle', 'backup').then(function(title) {
        modalObj.setBody(''); // TODO: Pass confirm notices to a template.
        // TODO: on modal ok action submit form.
        return;
    }).catch(function() {
        Notification.exception(new Error('Failed to load string: copycoursetitle'));
    });
}

/**
 * Handle the form submission event and gather the confirm conditions.
 *
 * @param {event} event The form submission event.
 */
const formSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    let confirmNotices = [];

    // Get all form elements that have data confirm attributes.
    const confirmElements = form.querySelectorAll('[data-confirm]');

    // Build array of confirmation item lables.
    confirmElements.forEach((element) => {
        // Special handling for checkboxes.
        if (element.type === 'checkbox' && element.checked != Boolean(Number(element.dataset.confirm))) {
            confirmNotices.push(element.labels[0].textContent.trim());
        } else if ((typeof element.value !== 'undefined') && element.value != element.dataset.confirm) {
            confirmNotices.push(element.labels[0].textContent.trim());
        }
    });

    // Call the modal to display the fields with confirmation messages.
    updateModal(form, confirmNotices);
};

/**
 * Initialise method for confirmation display.
 *
 * @param {string} formid The id of the form the confirm applies to.
 */
export const init = (formid) => {
    // Setup the modal to be used later.
    createModal();

    // Add submit even listener to the form.
    const form = document.getElementById(formid);
    form.addEventListener('submit', formSubmit);
};
