import { CreateTransferController } from '../modules/transfers/useCases/createTransfer/CreateTransferController'
import { ensureAuthenticated } from '../shared/infra/http/middlwares/ensureAuthenticated';
import { Router } from 'express'

const transferRoutes = Router()
const createTransferController = new CreateTransferController()

transferRoutes.post('/:receiver_id', ensureAuthenticated, createTransferController.handle);

export { transferRoutes };
