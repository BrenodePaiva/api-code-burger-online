import { v4 } from 'uuid'
import * as Yup from 'yup'

import User from '../models/User.js'

class UserController {
  // information user
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required().email(),
      password: Yup.string().required().min(6),
      admin: Yup.boolean(),
    })

    // information is valid ?
    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err.errors })
    }

    const { name, email, password, admin } = request.body

    // user exist ?
    const userExist = await User.findOne({
      where: { email },
    })

    if (userExist) {
      return response.status(409).json({ error: 'User already exist' })
    }

    try {
      // create user
      const user = await User.create({
        id: v4(),
        name,
        email,
        password,
        admin,
      })
      return response.status(201).json({ id: user.id, name, email, admin })
    } catch (error) {
      return response.status(500).json({ Erro: error })
    }
  }

  // ______________________________________________________________________

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      password: Yup.string(),
      newPassword: Yup.string().when('password', {
        is: (val) => val && val.length !== 0,
        then: (schema) => schema.required().min(6),
      }),
    })

    // information is valid ?
    try {
      await schema.validateSync(request.body, { abortEarly: false })
    } catch (err) {
      console.log(err)
      return response.status(400).json({ error: err.errors })
    }

    const { email } = request.params
    const { name, password, newPassword } = request.body

    let user = await User.findOne({
      where: { email },
    })

    try {
      if (password && newPassword && !user.google_id) {
        if (!(await user.checkPassword(password))) {
          console.log('password eRRado')
          return response
            .status(401)
            .json({ message: 'Make sure your password are correct' })
        }
        await User.update(
          {
            name,
            password: newPassword,
          },
          { where: { email } }
        )
      } else {
        await User.update(
          {
            name,
          },
          { where: { email } }
        )
      }

      user = await User.findOne({ where: { email } })

      return response.status(200).json({ id: user.id, name, email })
    } catch (error) {
      return response.status(500).json({ Error: error })
    }
  }
}

export default new UserController()
