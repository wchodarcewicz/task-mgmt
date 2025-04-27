import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

const createTestingModule = async (): Promise<TestingModule> => {
  return await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
};

export default createTestingModule;
