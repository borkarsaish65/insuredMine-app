const {
    Worker,
    isMainThread,
    parentPort
} = require('worker_threads');
const NUM_WORKERS = 4;
const path = require('path');
const agentModel = require('../model/agent');
const policyInfoModel = require('../model/policy_info');
const userModel = require('../model/user');
const MessageModel = require('../model/message');
const moment = require('moment');
const tz = require('moment-timezone');
const csvWorkers = [];

for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = new Worker(path.join(__dirname, './helper/csvWorker.js'));
    csvWorkers.push(worker);
}

let workerIndex = 0;

function scheduleMessageInsertion(messageNTime) {
    const { targetTime,message } = messageNTime;

        const delay = moment(targetTime).diff(moment().tz('Asia/Kolkata'), 'milliseconds');

    console.log(delay, 'delayyyy');

    if (delay <= 0) {
        console.error('Scheduled time is in the past:', targetTime);
        return;
    }
    
    setTimeout(() => {
        let messageRecord = new MessageModel({
            message
        })
        messageRecord.save().then((res)=>{
            console.log('message saved in the database');
        }).catch((err)=>{
            console.log('message saving failed');
        })

    }, delay); 
}


function validateDateTime(dateStr, timeStr) {
    // Validation logic using Moment.js
    const dateFormat = 'DD/MM/YYYY';
    const timeFormat = 'HH:mm';
  
    try {
      let res= moment(`${dateStr} ${timeStr}`, `${dateFormat} ${timeFormat}`);
      console.log(res,'<--')
      return true;
    } catch (error) {
        console.log(false,'<--')
      return false;
    }
  }


class AppController {

    uploadCSV = async (req, res, next) => {

        console.log('app working')
        let media = req.file;

        console.log(media, "<---")

        const worker = csvWorkers[workerIndex];
        workerIndex = (workerIndex + 1) % NUM_WORKERS;

        worker.postMessage({
            csvFilePath: media.path
        });

        worker.once('message', async message => {
            let data = message;


            console.log(data, "<---data")

            for (let record of data) {
                let {
                    agent,
                    userType,
                    policy_mode,
                    producer,
                    policy_number,
                    premium_amount_written,
                    premium_amount,
                    policy_type,
                    company_name,
                    category_name,
                    policy_start_date,
                    policy_end_date,
                    csr,
                    account_name,
                    email,
                    gender,
                    firstname,
                    city,
                    account_type,
                    phone,
                    address,
                    state,
                    zip,
                    dob
                } = record;

                const policyInfo = {
                    producer,
                    policy_number,
                    premium_amount_written,
                    premium_amount,
                    policy_type,
                    company_name,
                    category_name,
                    policy_start_date,
                    policy_end_date,
                    policy_mode,
                    csr
                }

                const userInfo = {
                    userType,
                    account_name,
                    email,
                    gender,
                    firstname,
                    city,
                    account_type,
                    phone,
                    address,
                    state,
                    zip,
                    dob
                }

                let agentInfo = {
                    agent
                }

                const agentRecord = await agentModel.findOne({
                    name: agent
                });

                if (!agentRecord) {
                    let newRecord = new agentModel({
                        name: agent
                    })
                    let result = await newRecord.save();

                } else {
                    console.log('record already exists');
                }

                let userResult = null;
                const userRecord = await userModel.findOne({
                    account_name
                })

                console.log(userRecord, 'userRecord')

                if (!userRecord) {
                    let newRecord = new userModel(userInfo)
                    userResult = await newRecord.save();

                } else {
                    userResult = userRecord;
                }

                let policyRecord = await policyInfoModel.findOne({
                    policy_number
                })

                if (!policyRecord) {
                    console.log(userResult, "<---")
                    let newRecord = new policyInfoModel({
                        ...policyInfo,
                        user: userResult._id
                    })
                    let r = await newRecord.save();
                    console.log(r, "<---r")
                }

                
            }


        });

        worker.once('error', error => {
            //log why the request was failed.
        });


        res.status(201).json({
            message:'CSV processing queued successfully!'
        });


    }
    getPolicyInfo = async (req, res, next) => {


        let {
            username
        } = req.query;

        if(!username)
        {
            res.status(400).json({
                error: 'username field is not present in the request'
            });
        }

        const user = await userModel.findOne({
            firstname: username
        });

        if (user) {
            const policies = await policyInfoModel.find({
                user: user._id
            }).populate('user');

            res.status(201).json(policies);
            console.log('Policies:', policies);
        } else {
            console.log('User not found');
        }
    }
    aggregatePolicy = async (req, res, next) => {

        const aggregatedData = await policyInfoModel.aggregate([{
                $lookup: {
                    from: 'users', 
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user' 
            },
            {
                $group: {
                    _id: '$user._id', 
                    firstname: {
                        $first: '$user.firstname'
                    }, 
                    totalPolicies: {
                        $sum: 1
                    }, 
                    totalPremium: {
                        $sum: '$premium_amount'
                    } 
                }
            },
            {
                $sort: {
                  totalPolicies: -1 
                }
              }
        ]);

        console.log('Aggregated Data:', aggregatedData);

        res.status(201).json(aggregatedData);
    }
    messageInDB = async (req, res, next) => {

                const {
                    message,
                    time,
                    date
                } = req.body;

                console.log(time,date)
                if (!validateDateTime(date, time)) {
                    return res.status(400).send("Invalid date or time format. Please use DD/MM/YYYY for date and HH:mm for time.");
                  }

                let combinedDateTime = moment(`${date} ${time}`, 'DD-MM-YYYY HH:mm:ss').tz('Asia/Kolkata');

                let currentTime = moment();

                console.log(currentTime,"currentTime")

                if (combinedDateTime.isBefore(currentTime)) {
                    return res.status(400).send("scheduled time has passed.");
                  } 

                scheduleMessageInsertion({
                    message,
                    targetTime:combinedDateTime
                });
                
                res.status(201).json({
                    success: true,
                    message: 'Message scheduled successfully'
                });
    }
}

module.exports = new AppController;