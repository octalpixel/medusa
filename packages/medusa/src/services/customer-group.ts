import { MedusaError } from "medusa-core-utils"
import { BaseService } from "medusa-interfaces"
import { DeepPartial, EntityManager } from "typeorm"
import { CustomerGroup } from ".."
import { CustomerGroupRepository } from "../repositories/customer-group"

type CustomerGroupConstructorProps = {
  manager: EntityManager
  customerGroupRepository: typeof CustomerGroupRepository
}
class CustomerGroupService extends BaseService {
  private manager_: EntityManager

  private customerGroupRepository_: typeof CustomerGroupRepository

  constructor({
    manager,
    customerGroupRepository,
  }: CustomerGroupConstructorProps) {
    super()

    this.manager_ = manager

    this.customerGroupRepository_ = customerGroupRepository
  }

  withTransaction(transactionManager: EntityManager): CustomerGroupService {
    if (!transactionManager) {
      return this
    }

    const cloned = new CustomerGroupService({
      manager: transactionManager,
      customerGroupRepository: this.customerGroupRepository_,
    })

    cloned.transactionManager_ = transactionManager

    return cloned
  }

  create(group: DeepPartial<CustomerGroup>): Promise<CustomerGroup> {
    return this.atomicPhase_(async (manager) => {
      try {
        const cgRepo: CustomerGroupRepository = manager.getCustomRepository(
          this.customerGroupRepository_
        )

        const created = cgRepo.create(group)

        const result = await cgRepo.save(created)

        return result
      } catch (err) {
        if (err.code === "23505") {
          throw new MedusaError(MedusaError.Types.DB_ERROR, err.detail)
        }
        throw err
      }
    })
  }

  retrieveByIds(groups: DeepPartial<CustomerGroup>[]) {
    throw new Error("TODO: implement me!")
  }
}

export default CustomerGroupService
