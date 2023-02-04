import { getSession } from "./Session";
import { PORTAL_URL } from "./Constants";
import { MidisProfile, Session } from "./types";
import { obj2query } from "./tools";
import ScheduleParse from "./parsers/Schedule";

export class Client {
  static async Login(login: string, password: string) {
    try {
      const session = await getSession(login, password);
      return new Client(session);
    } catch (e) {
      throw e;
    }
  }

  constructor(private session: Session) {}

  isActive() {
    return Date.now() - this.session.time <= 1000 * 60 * 10;
  }

  async getProfile(id = this.session.user_id): Promise<MidisProfile> {
    const response = await this.rest("user.get", { id });
    const [user] = response.result;
    const [department_id] = user.UF_DEPARTMENT;

    const department = await this.getDepartment(department_id);

    return {
      id,
      group: department,
      name: `${user.LAST_NAME} ${user.NAME} ${user.SECOND_NAME}`,
      avatar: user.PERSONAL_PHOTO,
      type: user.WORK_POSITION,
      online: user.IS_ONLINE == "Y",
      last_activity: +new Date(user.LAST_LOGIN),
    };
  }

  async getDepartment(id: number) {
    const response = await this.rest("department.get", { ID: id });
    return response.result[0].NAME;
  }

  async getSchedule(group = "") {
    let query = "IFRAME=Y&IM_AJAX_CALL=Y";
    let url = "/schedule";

    if (group) {
      url = "/mobile/teacher/schedule/spo_and_vo.php";
      query = "name=" + encodeURIComponent(group);
    }
    url += "?" + query;

    const response = await fetch(PORTAL_URL + url, {
      headers: {
        Cookie: this.session.Cookie,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const body = await response.text();

    return ScheduleParse(body, group === "");
  }

  async getGroups(gradeLevel: number) {
    type Groups = Array<{ GROUP_ID: string; GROUP_NAME: string }>;
    const response = await fetch(
      PORTAL_URL + "local/handlers/gradebook/groups.php",
      {
        method: "POST",
        body: "gradeLevel=" + gradeLevel,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: this.session.Cookie,
        },
      }
    );
    const data: Groups = await response.json();

    const students: Record<string, string> = {};

    for (const { GROUP_ID, GROUP_NAME } of data) {
      students[GROUP_ID] = GROUP_NAME;
    }

    return data;
  }

  async getStudents(groupId: number) {
    type Students = Array<{ USER_ID: string; USER_NAME: string }>;
    const response = await fetch(
      PORTAL_URL + "local/handlers/gradebook/students.php",
      {
        method: "POST",
        body: "groupID=" + groupId,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: this.session.Cookie,
        },
      }
    );
    const data: Students = await response.json();

    const students: Record<string, string> = {};

    for (const { USER_ID, USER_NAME } of data) {
      students[USER_ID] = USER_NAME;
    }

    return data;
  }

  private async rest(method: string, params: Record<string, unknown>) {
    const response = await fetch(PORTAL_URL + `/rest/${method}.json`, {
      method: "POST",
      headers: {
        Cookie: this.session.Cookie,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: obj2query({
        sessid: this.session.sessid,
        ...params,
      }),
    });
    const body = await response.json();
    if (response.status != 200) {
      throw new Error(`Midis Rest <${method}> error`, { cause: body });
    }
    return body;
  }
}
