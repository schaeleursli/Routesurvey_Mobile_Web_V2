import axios from "axios";
import Cookies from "js-cookie";

class StatsController {
  async getCurrentUserStats() {
    try {
      const res = await axios.get(
        "Stats/GetMyStats/" + Number(Cookies.get("login_user_id"))
      );
      //   console.log("res.data", res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getAllStats() {
    try {
      const res = await axios.get("Stats/GetAllStats");
      //   console.log("res.data", res.data);
      return res.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default new StatsController();
