import { validate } from 'class-validator';
import { CreateTaskRequestDto } from './create-task-request.dto';

describe('CreateTaskRequestDto', () => {
  let dto: CreateTaskRequestDto;

  beforeEach(() => {
    dto = new CreateTaskRequestDto();
    dto.userId = 'user001';
    dto.title = 'Test Task';
    dto.description = 'This is a test task';
    dto.startAt = '2025-05-24T12:00:00.000Z';
    dto.finishAt = '2025-05-24T14:00:00.000Z';
  });

  it('should be valid with all required properties', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('userId validation', () => {
    it('should fail when userId is empty', async () => {
      dto.userId = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when userId exceeds maximum length', async () => {
      dto.userId = 'a'.repeat(21); // MaxLength is 20
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('title validation', () => {
    it('should fail when title is empty', async () => {
      dto.title = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when title exceeds maximum length', async () => {
      dto.title = 'a'.repeat(201); // MaxLength is 200
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('description validation', () => {
    it('should be valid when description is empty', async () => {
      dto.description = '';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail when description exceeds maximum length', async () => {
      dto.description = 'a'.repeat(1001); // MaxLength is 1000
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('startAt validation', () => {
    it('should fail when startAt is empty', async () => {
      dto.startAt = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when startAt is not a valid date string', async () => {
      dto.startAt = 'invalid-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });
  });

  describe('finishAt validation', () => {
    it('should fail when finishAt is empty', async () => {
      dto.finishAt = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when finishAt is not a valid date string', async () => {
      dto.finishAt = 'invalid-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });
  });
});
