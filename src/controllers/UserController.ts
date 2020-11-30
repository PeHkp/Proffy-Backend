import { Request, Response } from "express";
import db from "./../database/connection";
import ConvertHoursToMinutes from "../utils/ConvertHoursToMinutes";

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

class UserController {
  async create(req: Request, res: Response) {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = req.body;

    const trx = await db.transaction();

    try {
      const insertedUsersId = await trx("Users").insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const user_id = insertedUsersId[0];

      const insertedClassesId = await trx("Classes").insert({
        subject,
        cost,
        user_id,
      });

      const class_id = insertedClassesId[0];

      const classSchedule = schedule.map((i: ScheduleItem) => {
        return {
          class_id,
          week_day: i.week_day,
          from: ConvertHoursToMinutes(i.from),
          to: ConvertHoursToMinutes(i.to),
        };
      });

      await trx("Class_schedule").insert(classSchedule);

      await trx.commit();

      return res.status(201).json({
        Ok: "Sucesso",
      });
    } catch (error) {
      await trx.rollback();
      return res.status(400).json({ error: "Erro" });
    }
  }

  async index(req: Request, res: Response) {
    const filters = req.query;

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if (!filters.week_day || !filters.subject || !filters.time) {
      res.status(400).json({
        erro: "adicione filtro para procurar uma sala",
      });
    }

    const timeInMinutes = ConvertHoursToMinutes(time);

    const classes = await db("Classes")
      .whereExists(function () {
        this.select("Class_schedule.*")
          .from("Class_schedule")
          .whereRaw("`Class_schedule`.`class_id`")
          .whereRaw("`Class_schedule`.`week_day` = ??", [Number(week_day)])
          .whereRaw("`Class_schedule`.`from` <= ??", [timeInMinutes])
          .whereRaw("`Class_schedule`.`to` > ??", [timeInMinutes]);
      })
      .where("Classes.subject", "=", subject)
      .join("Users", "Classes.user_id", "=", "Users.id")
      .select(["Classes.*", "Users.*"]);

    return res.json(classes);
  }
}
export default UserController;
