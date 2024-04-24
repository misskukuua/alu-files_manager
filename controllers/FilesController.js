import { ObjectId } from 'mongodb';
import userUtils from '../utils/user';
import fileUtils from '../utils/file';
import basicUtils from '../utils/basic';

class FilesController {
  /**
   * should retrieve the file document based on the ID:
   * - Retrieve the user based on the token
   * - If not found, return an error Unauthorized with a status code 401
   * - If no file document is linked to the user and the ID passed as parameter, return an error Not found with a status code 404
   * - Otherwise, return the file document
   */
  static async getShow(req, res) {
    const { userId } = await userUtils.getUserIdAndKey(req);

    if (!basicUtils.isValidId(userId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    if (!basicUtils.isValidId(fileId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const file = await fileUtils.getFile({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json(file);
  }

  /**
   * should retrieve all users file documents for a specific parentId and with pagination:
   * - Retrieve the user based on the token
   * - If not found, return an error Unauthorized with a status code 401
   * - Based on the query parameters parentId and page, return the list of file document
   *   - parentId: No validation of parentId needed - if the parentId is not linked to any user folder, returns an empty list. By default, parentId is equal to 0 = the root
   *   - Pagination: Each page should be 20 items max. page query parameter starts at 0 for the first page. If equals to 1, it means it’s the second page (from the 20th to the 40th), etc…
   */
  static async getIndex(req, res) {
    const { userId } = await userUtils.getUserIdAndKey(req);

    if (!basicUtils.isValidId(userId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let parentId = req.query.parentId || '0';

    if (parentId !== '0' && !basicUtils.isValidId(parentId)) {
      return res.status(400).json({ error: 'Invalid parentId' });
    }

    parentId = ObjectId(parentId);

    const page = parseInt(req.query.page) || 0;

    const files = await fileUtils.getFilesByParentId(userId, parentId, page);

    return res.json(files);
  }
}

export default FilesController;
