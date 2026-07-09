const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/;

export function isValidName(value) {
  return NAME_REGEX.test(value.trim());
}

export const NAME_ERROR = "El nombre solo puede contener letras y espacios.";