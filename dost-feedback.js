const callbackForm = document.querySelector('.feedback__form');
const callbackButton = callbackForm.querySelector('[type="submit"]');
const callbackStatus = callbackForm.querySelector('[role="status"]');
const callbackInputs = callbackForm.querySelectorAll('input');

callbackForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (callbackButton.disabled) return;
  if (callbackForm.method === 'dialog' || location.protocol === 'file:') {
    callbackStatus.textContent = 'Заявка не отправлена. Для обратного звонка откройте страницу на сервере проекта.';
    return;
  }

  const fields = new URLSearchParams(new FormData(callbackForm));
  callbackButton.disabled = true;
  for (const input of callbackInputs) input.readOnly = true;
  callbackStatus.removeAttribute('data-validation-status');
  callbackStatus.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(callbackForm.action, { method: 'POST', body: fields });
    if (response.status !== 201) {
      callbackStatus.dataset.validationStatus = 'error';
      callbackStatus.textContent = response.status === 422
        ? 'Проверьте имя и номер телефона и попробуйте ещё раз.'
        : 'Не удалось отправить заявку. Попробуйте ещё раз.';
      return;
    }
    callbackForm.reset();
    callbackStatus.textContent = 'Заявка принята. Специалист перезвонит вам.';
  } catch {
    callbackStatus.dataset.validationStatus = 'error';
    callbackStatus.textContent = 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.';
  } finally {
    for (const input of callbackInputs) input.readOnly = false;
    callbackButton.disabled = false;
  }
});
