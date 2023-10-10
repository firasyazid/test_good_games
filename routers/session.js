const express = require('express');
const app = express();
const {Session} = require('../Models/session');
const router = express.Router();


router.post('/add', async (req, res) => {
  try {
    const sess = new Session({
      nameUser: req.body.nameUser,
      fondInitial: req.body.fondInitial,
    });

    await sess.save();

    res.send(sess);
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).send('An error occurred while creating the session.');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      {
        fondInitial: req.body.fondInitial,
        fondFinal: req.body.fondFinal,
        Nbheure: req.body.Nbheure,
      },
      { new: true }
    );

    if (!session)
      return res.status(400).send('The session cannot be updated!');

    res.send(session);
  } catch (error) {
    console.error('Failed to update session:', error);
    res.status(500).send('An error occurred while updating the session.');
  }
});


router.put('/:sessionId/postes/:postName/increment', async (req, res) => {
  try {
    const { sessionId, postName } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const post = session.postes.find((p) => p.name === postName);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment "compteur" and "CompteurR" for the post
    post.compteur++;
    post.CompteurR++;

    // Calculate the sum of "compteur" values with special handling for posts 5 and 6
    let sum = 0;
    for (const poste of session.postes) {
      if (poste.name === '5' || poste.name === '6') {
        sum += (poste.compteur || 0) * 2.5; // Multiply by 2.5 for posts 5 and 6
      } else {
        sum += (poste.compteur || 0) * 1.5; // Multiply by 1.5 for all other posts
      }
    }

    let summ = 0;
    for (const poste of session.postes) {
      summ += poste.compteur || 0;
    }
    // Update the "SommeCopmteur" field in the session with the sum for the specific post
    session.SommeCopmteur = summ;

    // Update the "Somme" field with the calculated sum
    session.Somme = sum;

    // Save the updated session
    await session.save();

    return res.status(200).json({ message: 'Compteur incremented successfully', session });
  } catch (error) {
    console.error('Failed to increment compteur', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
  
router.get('/sumcompteurs/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      // Find the session by ID
      const session = await Session.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
      // Calculate the sum of compteur values
      let sum = 0;
      for (const poste of session.postes) {
        sum += poste.compteur || 0;
      }
  
      // Update the SommeCopmteur field in the session
      session.SommeCopmteur = sum;
  
      // Save the updated session
      await session.save();
  
      // Return the session with the calculated sum
      return res.status(200).json({ session });
    } catch (error) {
      console.error('Failed to retrieve session', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  

router.get('/somme/:sessionId/', async (req, res) => {
    try {
      const { sessionId } = req.params;
       const session = await Session.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
       let sum = 0;
      for (const poste of session.postes) {
        sum += poste.compteur || 0;
      }
  
       const multipliedSum = sum * 1.5;
  
       session.SommeCopmteur = sum;
  
       session.Somme = multipliedSum;
  
       await session.save();
  
       return res.status(200).json({ session });
    } catch (error) {
      console.error('Failed to retrieve session', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  

router.get('/display', async (req, res) => {
    try {
      const sessions = await Session.find().sort({ dateSession: -1 });
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
router.get('/display/:id', async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/sum', async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

    const sessions = await Session.aggregate([
      {
        $match: {
          dateSession: { $gte: startOfDay, $lt: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalSomme: { $sum: '$Somme' },
        },
      },
    ]);

    const totalSum = sessions.length > 0 ? sessions[0].totalSomme : 0;

     return res.send({ totalSum:totalSum});
  } catch (error) {
    console.error('Failed to calculate sum of sessions', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/sumMonth', async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const sessions = await Session.aggregate([
      {
        $match: {
          dateSession: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalSomme: { $sum: '$Somme' },
        },
      },
    ]);

    const totalSum = sessions.length > 0 ? sessions[0].totalSomme : 0;
    return res.send({ totalSum:totalSum});
  } catch (error) {
    console.error('Failed to calculate sum of sessions', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

 
router.get('/last-session', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ dateSession: -1 }).limit(1);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/:sessionId/postes/:postName/decrement', async (req, res) => {
  try {
    const { sessionId, postName } = req.params;

     const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

     const post = session.postes.find((p) => p.name === postName);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

     post.CompteurR--;

  
     await session.save();

    return res.status(200).json({ message: 'Compteur incremented successfully', session });
  } catch (error) {
    console.error('Failed to increment compteur', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/sum-by-day', async (req, res) => {
  try {
     const currentDate = new Date();
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() + 6));

    // Find sessions within the current week
    const sessions = await Session.find({
      dateSession: { $gte: startOfWeek, $lte: endOfWeek }
    });

    const sumByDay = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0
    };

    sessions.forEach(session => {
      const dayOfWeek = new Date(session.dateSession).toLocaleString('en-US', { weekday: 'long' });
      session.postes.forEach(poste => {
        sumByDay[dayOfWeek] += poste.compteur || 0;
      });
    });

    return res.status(200).json(sumByDay);
  } catch (error) {
    console.error('Failed to calculate sum by day', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', (req, res)=>{
  Session.findByIdAndRemove(req.params.id).then(user =>{
      if(user) {
          return res.status(200).json({success: true, message: 'the SESSSION is deleted!'})
      } else {
          return res.status(404).json({success: false , message: "user not found!"})
      }
  }).catch(err=>{
     return res.status(500).json({success: false, error: err}) 
  })
}) ;

router.put('/:sessionId/postes/:postName/incrementt', async (req, res) => {
  try {
    const { sessionId, postName } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const post = session.postes.find((p) => p.name === postName);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

     post.compteur++;
    post.CompteurR++;

     let sum = 0;
    for (const poste of session.postes) {
      if (poste.name === '5' || poste.name === '6') {
        sum += (poste.compteur || 0) * 4;  
      } else {
        sum += (poste.compteur || 0) * 3;  
      }
    }

    let summ = 0;
    for (const poste of session.postes) {
      summ += poste.compteur || 0;
    }
     session.SommeCopmteur = summ;

     session.Somme = sum;

     await session.save();

    return res.status(200).json({ message: 'Compteur incremented successfully', session });
  } catch (error) {
    console.error('Failed to increment compteur', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/sumMonth2', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;  

    const sessions = await Session.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$dateSession' },
          },
          totalSomme: { $sum: '$Somme' },
        },
      },
      {
        $sort: {
          '_id.month': -1, 
        },
      },
    ]);

    const monthlySum = {};

    sessions.forEach((session) => {
      const month = session._id.month;
      const monthName = getMonthName(month);
      monthlySum[monthName] = session.totalSomme;
    });

    const orderedMonthlySum = {};

    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + 11 - i) % 12 + 1;  
      const monthName = getMonthName(monthIndex);
      if (monthlySum.hasOwnProperty(monthName)) {
        orderedMonthlySum[monthName] = monthlySum[monthName];
      } else {
        orderedMonthlySum[monthName] = 0;
      }
    }

    return res.send(orderedMonthlySum);
  } catch (error) {
    console.error('Failed to calculate sum of sessions', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

function getMonthName(month) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return monthNames[month - 1];
}


module.exports =router;