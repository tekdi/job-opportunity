import { DataSource, Repository } from 'typeorm';
import { Opportunity } from '../entities/opportunity.entity';

export const OpportunityRepositoryProvider = {
  provide: 'OPPORTUNITY_REPOSITORY',
  useFactory: (dataSource: DataSource): Repository<Opportunity> => {
    return dataSource.getRepository(Opportunity);
  },
  inject: [DataSource],
};
