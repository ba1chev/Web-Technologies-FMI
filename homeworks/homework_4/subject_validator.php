<?php

declare(strict_types=1);

mb_internal_encoding('UTF-8');
mb_regex_encoding('UTF-8');

header('Content-Type: application/json; charset=utf-8');

final class RequestParser
{
    public static function parse(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';

        if (stripos($contentType, 'application/json') !== false) {
            return self::parseJsonBody();
        }

        if (!empty($_POST)) {
            return $_POST;
        }

        $jsonData = self::parseJsonBody();
        if (!empty($jsonData)) {
            return $jsonData;
        }

        return $_POST;
    }

    private static function parseJsonBody(): array
    {
        $rawInput = file_get_contents('php://input');
        if ($rawInput === false || $rawInput === '') {
            return [];
        }

        $decoded = json_decode($rawInput, true);
        return is_array($decoded) ? $decoded : [];
    }
}

final class SubjectValidator
{
    private const VALID_GROUPS = ['М', 'ПМ', 'ОКН', 'ЯКН'];

    private const NAME_MIN = 2;
    private const NAME_MAX = 150;
    private const TEACHER_MIN = 3;
    private const TEACHER_MAX = 200;
    private const DESCRIPTION_MIN = 10;

    /** @var array<string, string> */
    private array $errors = [];

    /**
     * @param array<string, mixed> $data
     * @return array<string, string>
     */
    public function validate(array $data): array
    {
        $this->errors = [];

        $this->validateStringField(
            $data,
            'name',
            'Името на учебния предмет',
            self::NAME_MIN,
            self::NAME_MAX
        );

        $this->validateStringField(
            $data,
            'teacher',
            'Името на преподавателя',
            self::TEACHER_MIN,
            self::TEACHER_MAX
        );

        $this->validateStringField(
            $data,
            'description',
            'Описанието',
            self::DESCRIPTION_MIN,
            null
        );

        $this->validateGroup($data);
        $this->validateCredits($data);

        return $this->errors;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function validateStringField(
        array $data,
        string $field,
        string $label,
        int $min,
        ?int $max
    ): void {
        if (!array_key_exists($field, $data) || $data[$field] === null) {
            $this->errors[$field] = $label . ' е задължително поле';
            return;
        }

        $rawValue = $data[$field];

        if (!is_string($rawValue) && !is_numeric($rawValue)) {
            $this->errors[$field] = $label . ' трябва да е текст';
            return;
        }

        $value = trim((string) $rawValue);

        if ($value === '') {
            $this->errors[$field] = $label . ' е задължително поле';
            return;
        }

        $length = mb_strlen($value, 'UTF-8');

        if ($length < $min) {
            $this->errors[$field] = sprintf(
                '%s трябва да е с дължина поне %d символа, а вие сте въвели %d',
                $label,
                $min,
                $length
            );
            return;
        }

        if ($max !== null && $length > $max) {
            $this->errors[$field] = sprintf(
                '%s трябва да е с дължина най-много %d символа, а вие сте въвели %d',
                $label,
                $max,
                $length
            );
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function validateGroup(array $data): void
    {
        if (!array_key_exists('group', $data) || $data['group'] === null) {
            $this->errors['group'] = 'Групата е задължително поле';
            return;
        }

        $rawValue = $data['group'];

        if (!is_string($rawValue)) {
            $this->errors['group'] = 'Невалидна група, изберете една от М, ПМ, ОКН и ЯКН';
            return;
        }

        $value = trim($rawValue);

        if ($value === '') {
            $this->errors['group'] = 'Групата е задължително поле';
            return;
        }

        if (!in_array($value, self::VALID_GROUPS, true)) {
            $this->errors['group'] = 'Невалидна група, изберете една от М, ПМ, ОКН и ЯКН';
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function validateCredits(array $data): void
    {
        if (!array_key_exists('credits', $data) || $data['credits'] === null) {
            $this->errors['credits'] = 'Кредитите са задължително поле';
            return;
        }

        $rawValue = $data['credits'];

        if (is_string($rawValue) && trim($rawValue) === '') {
            $this->errors['credits'] = 'Кредитите са задължително поле';
            return;
        }

        $intValue = null;

        if (is_int($rawValue)) {
            $intValue = $rawValue;
        } elseif (is_string($rawValue) && preg_match('/^[+-]?\d+$/', trim($rawValue)) === 1) {
            $intValue = (int) trim($rawValue);
        } elseif (is_float($rawValue) && is_finite($rawValue) && floor($rawValue) === $rawValue) {
            $intValue = (int) $rawValue;
        }

        if ($intValue === null) {
            $this->errors['credits'] = 'Кредитите трябва да са цяло положително число';
            return;
        }

        if ($intValue <= 0) {
            $this->errors['credits'] = sprintf(
                'Кредитите трябва да са цяло положително число, а вие сте въвели %d',
                $intValue
            );
        }
    }
}

$data = RequestParser::parse();
$validator = new SubjectValidator();
$errors = $validator->validate($data);

if (empty($errors)) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(
        ['success' => false, 'errors' => $errors],
        JSON_UNESCAPED_UNICODE
    );
}
