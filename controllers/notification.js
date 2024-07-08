const Notification = require("../models/notification");
const { getChannel } = require("../config/RabbitMQ");
const User = require("../models/user");
const mongoose = require("mongoose");

const retryOperation = (operation, delay, retries) =>
  new Promise((resolve, reject) => {
    operation()
      .then(resolve)
      .catch((error) => {
        if (retries > 0) {
          setTimeout(() => {
            console.log(`Retrying... Attempts left: ${retries}`);
            retryOperation(operation, delay, retries - 1)
              .then(resolve)
              .catch(reject);
          }, delay);
        } else {
          reject(error);
        }
      });
  });

exports.createNotification = async (req, res) => {
  const { userId, message } = req.body;
  try {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    const notification = new Notification({ userId, message, read: false });
    await notification.save();

    const channel = getChannel();
    const operation = async () => {
      channel.sendToQueue(
        "notificationQueue",
        Buffer.from(JSON.stringify(notification))
      );
    };

    await retryOperation(operation, 2000, 3);

    console.log("Notification sent to RabbitMQ", notification);

    res.status(201).json(notification);
  } catch (error) {
    console.log("Error during notification creation or sending:", error);
    res.status(500).json({ message: "Error creating notification." });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications." });
  }
};

exports.GetallnotificationByUser = async (req, res) => {
  try {
    let { skip, per_page, sorton, sortdir, match } = req.body;
    let { userId } = req.params;
    console.log("req.body", req.body);
    console.log("req.params", req.params);

    let query = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $facet: {
          stage1: [
            {
              $group: {
                _id: null,
                count: {
                  $sum: 1,
                },
              },
            },
          ],
          stage2: [
            {
              $skip: skip,
            },
            {
              $limit: per_page,
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$stage1",
        },
      },
      {
        $project: {
          count: "$stage1.count",
          data: "$stage2",
        },
      },
    ];

    if (match) {
      query = [
        {
          $match: {
            $or: [
              {
                message: { $regex: match, $options: "i" },
              },
            ],
          },
        },
      ].concat(query);
    }

    if (sorton && sortdir) {
      let sort = {};
      sort[sorton] = sortdir == "desc" ? -1 : 1;
      query = [
        {
          $sort: sort,
        },
      ].concat(query);
    } else {
      let sort = {};
      sort["createdAt"] = -1;
      query = [
        {
          $sort: sort,
        },
      ].concat(query);
    }

    console.log("Query: ", JSON.stringify(query));

    const list = await Notification.aggregate(query);

    console.log("Result from Notification ", list);

    res.json(list);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification." });
  }
};
