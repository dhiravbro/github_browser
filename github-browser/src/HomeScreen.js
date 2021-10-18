import React ,{useState} from 'react'
import './HomeScreen.css';
import axios from 'axios';

const HomeScreen = () => {
    const [username,setUsername]= useState();
    const onChangeHandler = (event) => setUsername(event.target.value);
    const [repoName,setRepoName] = useState();
    const repoNameChangeHandler = (event) => setRepoName(event.target.value);
    const [repoData,setRepoData] = useState([]);
    const [repoBranchDetails,setRepoBranchDetails] = useState([]);
    const [repoIssueDetails,setRepoIssueDetails] = useState([]);
    const [tab,setTab]  = useState(1);
    const [modalState,setModalState] = useState(false);
    const [branchModalState,setBranchModalState] = useState(false);
    const [selectedRepo,setSelectedRepo] = useState(-1);
    const [selectedBranch,setSelectedBranch] = useState();
    const [branchCommitData,setBranchCommitData] = useState([]);
    const toggleModal = () => setModalState(!modalState);
    const toggleBranchModal = async (branch) => {
        const user = repoData[selectedRepo].owner.login;
        const repo = repoData[selectedRepo].name;
        const url = "https://api.github.com/repos/"+user+"/"+repo+"/commits?sha="+branch;
        try{
            const res = await axios.get(url);
            console.log('commit data',res.data);
            setBranchCommitData(res.data);
        }catch(err){
            console.log(err);
        }
        setBranchModalState(!modalState);
    }

    const changeTab = (val) => setTab(val);
    const fetchData = async () => {
        const url = "https://api.github.com/repos/"+username+"/"+repoName;
        try{
            const res = await axios.get(url);
            setRepoData((prevValue) => {
            return [...prevValue,res.data]});
            // setSelectedRepo(repoData.length);
        }catch(err){
            console.log(err);
        }
    }
    const fetchRepoBranchData = async (url) => {
        let reqUrl = url.substring(0,url.length - 9);
        try{
            const res = await axios.get(reqUrl);
            setRepoBranchDetails(res.data);
            console.log('branch data',res.data);
        }catch(err){
            console.log(err);
        }
    }
    const fetchRepoIssuesData = async (url) => {
        let reqUrl = url.substring(0,url.length - 9);
        try{
            const res = await axios.get(reqUrl);
            setRepoIssueDetails(res.data);
            console.log('issues data',res.data);
        }catch(err){
            console.log(err);
        }
    }
    const removeSelectedRepo = () => {
        setRepoData([...repoData.slice(0,selectedRepo),...repoData.slice(selectedRepo+1,repoData.length)]);
    }
    
    return (
        
        <div className="view">
            <div className="repo-list">{repoData.map((repo,index) => {
                return <div 
                key={index}
                className={"repo-tab "+(selectedRepo===index&&"selected-repo")} 
                onClick ={() => {
                    fetchRepoBranchData(repo.branches_url);
                    fetchRepoIssuesData(repo.issue_events_url);
                    setSelectedRepo(index);
                }}>
                    <p className="repo-name">{repo.full_name}</p>
                    <p className="repo-description">{repo.description}</p>
                </div>
            })}</div>
            <div className ="repo-details">
            <button className="delete-repo-btn" onClick={removeSelectedRepo}>DELETE</button>
            <div className="repo-details-div">
            
            <div className="tab-div">
                <button className = {"tab "+(tab===1&&"active-tab")} onClick = {() => changeTab(1)}>Branches</button>
                <button className = {"tab "+(tab===2&&"active-tab")} onClick = {() => changeTab(2)}>Issues</button>
            </div>
            <div className="active-view">
            {tab===1&&repoBranchDetails.map((branch) => {
                return <div className="branch" 
                            onClick={()=>{
                                setSelectedBranch(branch.name);
                                toggleBranchModal(branch.name);
                            }}
                        >{branch.name}
                        </div>
                        })}
                {tab===2&&repoIssueDetails.map((issue,index) => {
                    return<div className = "issue-tab" key={index}>
                            <p className="issue-title">{issue.issue.title}</p>
                            <div className="issue-author">
                                <img src={issue.issue.user.avatar_url} alt="avatar" className ="avatar"/>
                                <span>{issue.issue.user.login}</span>
                            </div>
                        </div>
                })}
            </div>
                
            </div>
            </div>
            <button className="add-repo-button" onClick={toggleModal}>+</button>
            {modalState&&<div className="overlay" onClick ={toggleModal}></div>}
            {modalState&&<div className="add-repo-modal">
            <div className="input-box">
                <label>Org/User Name</label>
                <input className ="input-box" value={username} onChange={onChangeHandler}/>
            </div>
            <div className ="input-box">
                <label>Repository name</label>
                <input  value={repoName} onChange={repoNameChangeHandler}/>
            </div>
                <button className = "repo-add-btn"onClick ={fetchData}>Add Repository</button>
            </div>}
            {branchModalState&&<div className="overlay" onClick ={() => setBranchModalState(false)}></div>}
            {branchModalState&&<div className="branch-commit-modal">
                {branchCommitData.map((commit) => {
                    return <div className="commit-div">
                        <p className="commit-date">{commit.commit.author.date}</p>
                        <p className="commit-message">{commit.commit.message}</p>
                        <img className = "avatar" src ={commit.author.avatar_url} alt = "avatar"/>
                        <p className="author">{commit.commit.author.name}</p>
                    </div>;
                })}
            </div>}
        </div>
    )
}
export default HomeScreen;