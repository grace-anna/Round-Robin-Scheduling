import {useState,useEffect} from 'react'

  const algorithm = (processes, timeQuantum) => {
  if (!timeQuantum || timeQuantum <= 0) {
    return { results: [], ganttChart: [], avgTurnAroundTime: 0, avgWaitingTime: 0 };
  }

  let results = [];
  let ganttChart = [];
  let p=processes.map(proc=>({...proc,remainingTime:proc.burstTime}));
  p=p.sort((a,b)=>a.arrivalTime-b.arrivalTime)
  const n=p.length;
  let totalTurnAroundTime=0,totalWaitingTime=0,avgWaitingTime=0,avgTurnAroundTime=0;

  const queue=[];
  let time = 0, completed = 0, idx = 0,x=0,runtime=0;
  let inQueue = new Array(n).fill(0);
  time=p[0].arrivalTime;
  queue.push(0);
  inQueue[0]=1;
  idx=1;

  while (completed < n) {
        if (queue.length===0&&idx<n) {
            time = Math.max(time,p[idx].arrivalTime);
            queue.push(idx);
            inQueue[idx] = 1;
            idx++;
        }
        x=queue.shift();
        let runtime=p[x].remainingTime>timeQuantum?timeQuantum:p[x].remainingTime;
   ganttChart.push({
  id: p[x].id,
  start: time,
  end: time + runtime,
  queueSnapshot: [...queue.map(i => p[i].id)]
});   
        time+=runtime;
        p[x].remainingTime-=runtime;
        while (idx < n && p[idx].arrivalTime <= time) {
      if (!inQueue[idx]) {
        queue.push(idx);
        inQueue[idx] = 1;
      }
      idx++;
    }

       
      
      if(p[x].remainingTime>0)
      {
        queue.push(x);
      }
      else{
        p[x].completionTime=time;
        p[x].turnAroundTime=p[x].completionTime-p[x].arrivalTime;
        p[x].waitingTime=p[x].turnAroundTime-p[x].burstTime;
        totalTurnAroundTime+=p[x].turnAroundTime;
        totalWaitingTime+=p[x].waitingTime;
        results.push(p[x]);
        completed++;
      } 
  }
  
  avgWaitingTime=totalWaitingTime/n;
  avgTurnAroundTime=totalTurnAroundTime/n;  
  return { results, ganttChart,avgTurnAroundTime,avgWaitingTime};
}
const App = () => {
  
const [showcount,setshowcount]=useState(0);
 const [output, setOutput] = useState(null);
 const [tq, setTq] = useState(2);
  const [newPID, setNewPID] = useState('')
  const [newAT,setNewAT]=useState('')
  const [newBT,setNewBT]=useState('')
  const [processes, setProcesses] = useState([
    { arrivalTime: 0, burstTime: 5, id: 'P1' ,remainingTime:5},
    { arrivalTime: 4, burstTime: 2, id: 'P2',remainingTime:2 },
    { arrivalTime: 5, burstTime: 4, id: 'P3' ,remainingTime:4},
  ])
  
const handleBTchange=(event)=>{setNewBT(event.target.value)}

const handleATchange=(event)=>{setNewAT(event.target.value)}
const handlePIDchange=(event)=>{setNewPID(event.target.value)}
const addProcess=(event)=>{event.preventDefault();
      const process={arrivalTime: Number(newAT),burstTime:Number(newBT), id:newPID};
      setProcesses(processes.concat(process))
      setNewAT('')
      setNewBT('')
     }
const handleCalculate = () => {
   if (tq <= 0 || isNaN(tq)) {
    alert("Please enter a Time Quantum greater than 0");
    return;}
  const result = algorithm(processes, tq);
  setOutput(result);
  setshowcount(0);
};
useEffect(()=>{if (output&&showcount<output.ganttChart.length){const timer=setTimeout(()=>{setshowcount(showcount+1)},800);return ()=>clearTimeout(timer)}},[output,showcount]);

return (
    <div className="container">
      <h2>Round Robin Scheduler</h2>
      <div>
        <div style={{ marginBottom: '20px' }}>
  <label>Time Quantum: </label>
 <input 
  type="number" 
  value={tq} 
  onChange={(e) => {
    const val = Number(e.target.value);
    // Only update if the value is a positive number
    // This prevents the "0" state while typing
    setTq(val > 0 ? val : ''); 
  }} 
  min="1"
  placeholder="Min 1"
/></div>
</div>
      <form onSubmit={addProcess}>
        <div>
          <div>Process Id: <input value={newPID} onChange={handlePIDchange} /></div>
          <div>Arrival Time: <input value={newAT} onChange={handleATchange}/></div>
          <div>Burst Time: <input value={newBT} onChange={handleBTchange} /></div>

        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>

      <h2>Process Table</h2>
      <div className="process-list">
      
      <table >
        <thead>
          <tr>
            <th>Process</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p)=>

            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.arrivalTime}</td>
              <td>{p.burstTime}</td>
            </tr>
          )}
        </tbody>
      </table>
      
      </div>
      <button className="cal-btn" onClick={handleCalculate} style={{ marginTop: '20px', display: 'block' }}>
  Calculate
</button>
<div className="gantt-container">
  {output && output.ganttChart.slice(0, showcount).map((bar, index) => (
    <div key={index} className="gantt-block">

      <span className="pid">{bar.id}</span>      
      <span className="time-label start">{bar.start}</span>
      <span className="time-label end">{bar.end}</span>
    </div>
  ))}
</div>

<div className="queue-section">
    <h3>Ready Queue</h3>
    <div className="queue-pipe">
      {output && showcount < output.ganttChart.length ? (
        output.ganttChart[showcount].queueSnapshot.map((pid, i) => (
          <div key={i} className="queue-node">{pid}</div>
        ))
      ) : "Queue Empty"}
    </div>
  </div>
<div className='stats'>
{output && (
  <div>
    <h3>Results</h3>
    <div className='stats'>
  {output && (
    <div>
      <h3>Calculation Results</h3>
      <table >
        <thead>
          <tr>
            <th>Process</th>
            <th>Arrival Time</th>
            <th>Burst Time</th>
            <th>Completion Time</th>
            <th>Turnaround Time</th>
            <th>Waiting Time</th>
          </tr>
        </thead>
        <tbody>
          {output.results.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.arrivalTime}</td>
              <td>{p.burstTime}</td>
              <td>{p.completionTime}</td>
              <td>{p.turnAroundTime}</td>
              <td>{p.waitingTime}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p><strong>Average Waiting Time:</strong> {output.avgWaitingTime.toFixed(2)}</p>
      <p><strong>Average Turnaround Time:</strong> {output.avgTurnAroundTime.toFixed(2)}</p>
    </div>
  )}
</div>
  </div>
)}
</div>
</div>)
};
export default App
