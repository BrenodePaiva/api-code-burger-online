import * as Yup from "yup";

import Category from "../models/Category.js";

class CategoryController {
  // information category
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    // information is valid ?
    try {
      await schema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { name } = request.body;

    // category exist
    const categoryExist = await Category.findOne({
      where: { name },
    });

    if (categoryExist) {
      return response.status(400).json({ error: "Category already exist" });
    }

    // create category
    const { filename: path } = request.file;
    try {
      const category = await Category.create({ name, path });

      return response.status(201).json({ id: category.id, name, path });
    } catch (err) {
      return response.status(500).json({ Error: err });
    }
  }

  // ___________________________________________________________________________

  // list category
  async index(request, response) {
    try {
      const categories = await Category.findAll();
      return response.status(200).json(categories);
    } catch (err) {
      return response.status(500).json({ Error: err });
    }
  }

  // ___________________________________________________________________________

  // update category
  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
    });

    try {
      await schema.validateSync(request.body);
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { id } = request.params;
    let category = await Category.findByPk(id);

    if (!category) {
      return response.status(404).json({ message: "Category not found" });
    }

    // updating category
    let path;
    if (request.file) {
      path = request.file.filename;
    }
    const { name } = request.body;

    try {
      await Category.update(
        {
          name,
          path,
        },
        { where: { id } }
      );
      category = await Category.findByPk(id);
      return response.status(200).json(category);
    } catch (err) {
      return response.status(500).json({ Error: err });
    }
  }
}

export default new CategoryController();
