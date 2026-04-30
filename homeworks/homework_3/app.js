'use strict';

const USERS_API = 'https://jsonplaceholder.typicode.com/users';

const form = document.getElementById('registration-form');
const registerBtn = document.getElementById('register-btn');
const successEl = document.getElementById('success');
const generalErrorEl = document.getElementById('general-error');

const fields = {
    username: document.getElementById('username'),
    name: document.getElementById('name'),
    familyName: document.getElementById('family-name'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    street: document.getElementById('street'),
    city: document.getElementById('city'),
    postalCode: document.getElementById('postal-code'),
};

const validators = {
    username(value) {
        if (!value) return 'Потребителското име е задължително.';
        if (value.length < 3 || value.length > 10) return 'Потребителското име трябва да е между 3 и 10 символа.';
        return '';
    },

    name(value) {
        if (!value) return 'Името е задължително.';
        if (value.length > 50) return 'Името не може да надвишава 50 символа.';
        return '';
    },

    familyName(value) {
        if (!value) return 'Фамилията е задължителна.';
        if (value.length > 50) return 'Фамилията не може да надвишава 50 символа.';
        return '';
    },

    email(value) {
        if (!value) return 'Имейлът е задължителен.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Моля, въведете валиден имейл адрес.';
        return '';
    },

    password(value) {
        if (!value) return 'Паролата е задължителна.';
        if (value.length < 6 || value.length > 10) return 'Паролата трябва да е между 6 и 10 символа.';
        if (!/[A-Z]/.test(value)) return 'Паролата трябва да съдържа поне една главна буква.';
        if (!/[a-z]/.test(value)) return 'Паролата трябва да съдържа поне една малка буква.';
        if (!/\d/.test(value)) return 'Паролата трябва да съдържа поне една цифра.';
        return '';
    },

    postalCode(value) {
        if (!value) return '';
        const postalRegex = /^\d{4}$|^\d{5}-\d{4}$/;
        if (!postalRegex.test(value)) return 'Пощенският код трябва да е във формат 1111 или 11111-1111.';
        return '';
    },
};

const showError = (fieldKey, message) => {
    const input = fields[fieldKey];
    const errorId = input.id + '-error';
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.toggle('visible', !!message);
    }
    input.classList.toggle('invalid', !!message);
};

const clearAllErrors = () => {
    Object.keys(fields).forEach(key => showError(key, ''));
    generalErrorEl.classList.remove('visible');
    generalErrorEl.textContent = '';
    successEl.classList.remove('visible');
    successEl.textContent = '';
};

const validateAll = () => {
    let isValid = true;

    Object.entries(validators).forEach(([key, validate]) => {
        const value = fields[key].value.trim();
        const error = validate(value);
        showError(key, error);
        if (error) isValid = false;
    });

    return isValid;
};

const fetchExistingUsers = async () => {
    const response = await fetch(USERS_API);
    if (!response.ok) throw new Error('Неуспешно зареждане на потребителите.');
    return response.json();
};

const registerUser = async (userData) => {
    const response = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Неуспешна регистрация.');
    return response.json();
};

const handleSubmit = async (event) => {
    event.preventDefault();
    clearAllErrors();

    const isValid = validateAll();
    if (!isValid) return;

    registerBtn.disabled = true;
    registerBtn.textContent = 'Регистриране...';

    try {
        const existingUsers = await fetchExistingUsers();
        const usernameValue = fields.username.value.trim();

        const usernameTaken = existingUsers.some(
            user => user.username.toLowerCase() === usernameValue.toLowerCase()
        );

        if (usernameTaken) {
            showError('username', 'Потребител с това потребителско име вече съществува.');
            return;
        }

        const userData = {
            username: usernameValue,
            name: `${fields.name.value.trim()} ${fields.familyName.value.trim()}`,
            email: fields.email.value.trim(),
            address: {
                street: fields.street.value.trim(),
                city: fields.city.value.trim(),
                zipcode: fields.postalCode.value.trim(),
            },
        };

        const result = await registerUser(userData);

        successEl.textContent = `Регистрацията е успешна! Вашият потребителски ID е ${result.id}.`;
        successEl.classList.add('visible');
        form.reset();
    } catch (error) {
        generalErrorEl.textContent = error.message || 'Възникна грешка. Моля, опитайте отново.';
        generalErrorEl.classList.add('visible');
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Регистрация';
    }
};

form.addEventListener('submit', handleSubmit);
