/// <reference path="./admin.d.ts"/>
import * as React from 'react';
import {flatten} from 'flat';
import * as queryString from "query-string";
import {pick, get, set, find} from "lodash-es";
import FormPage from "../form/FormPage";
import FormEmbed from "./FormEmbed";
import FormList from "./FormList";
import FormEdit from "./FormEdit/FormEdit";
import ResponseTable from "./ResponseTable";
import Loading from "src/common/Loading/Loading";
import MockData from "src/common/util/MockData";
import "./admin.scss";
import { withAuthenticator } from 'aws-amplify-react';
import { Auth, Hub, Logger, API } from 'aws-amplify';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
const logger = new Logger('MyClass');

const STATUS_LOADING = 0;
const STATUS_ERROR = 11;
const STATUS_ACCESS_DENIED = 21;
const STATUS_CENTER_LIST = 31;
const STATUS_FORM_LIST = 41;
const STATUS_FORM_RENDER = 51; // Not used.
const STATUS_FORM_RESPONSES = 61;
const STATUS_FORM_RESPONSE_SUMMARY = 62;
const STATUS_FORM_EMBED = 71;
const STATUS_FORM_EDIT = 81;

class FormAdminPage extends React.Component<IFormAdminPageProps, IFormAdminPageState> {
    constructor(props:any) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            centerList: [],
            formList: [],
            center: null,
            selectedForm: null,
            status: STATUS_LOADING,
            hasError: false,
            userId: this.props.authData.id,
            apiKey: document.getElementById('ccmt-cff-admin').getAttribute('data-ccmt-cff-api-key')
        }
        Hub.listen('auth', this, 'MyListener');
    }

    onHubCapsule(capsule) {
        const { channel, payload } = capsule;
        console.log(capsule);
        if (channel === 'auth') { this.onAuthEvent(payload); }
    }

    onAuthEvent(payload) {
        const { event, data } = payload;
        switch (event) {
            case 'signIn':
                logger.debug('user signed in');
                break;
            case 'signUp':
                logger.debug('user signed up');
                break;
            case 'signOut':
                logger.debug('user signed out');
                break;
            case 'signIn_failure':
                logger.debug('user sign in failed');
                break;
        }
    }

    editForm(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_EDIT
        });
    }

    embedForm(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_EMBED
        })
    }

    componentDidUpdate(prevProps, prevState) {
        let stateKeysToEncode = ["selectedForm.name", "selectedForm.center", "selectedForm.id", "center", "status"];
        if (pick(this.state, stateKeysToEncode) != pick(prevState, stateKeysToEncode)) {
            let encodedState = flatten(pick(this.state, stateKeysToEncode));
            let newQS = queryString.stringify(encodedState);
            window.location.hash = newQS;//queryString.stringify(encodedState);   
        }
    }


    loadResponses(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_RESPONSES
        });
    }
    loadResponseSummary(form) {
        this.setState({
            selectedForm: form,
            status: STATUS_FORM_RESPONSE_SUMMARY
        })
    }
    componentWillReceiveProps(nextProps) {
        console.log(nextProps, nextProps.authState);
        if (this.props.authState != "signedIn" && nextProps.authState == "signedIn") {

        }
    }
    componentDidMount() {
        if (!this.state.userId) {
            Auth.currentCredentials().then(e => {
                console.warn(e);
                if (!e) {
                    Auth.signOut();
                    return;
                }
                this.setState({"userId": e.params.IdentityId}, this.loadForms);
            });
        }
        else {
            this.loadForms();
        }
    }
    loadForms() {
        return API.get("CFF", "centers", {}).then(e => {
            this.setState({"centerList": e.res, "center": e.res[0]});
            return this.loadFormList();
        }).catch(e => {
            this.setState({status: STATUS_ACCESS_DENIED});
        });
    }
    loadFormList() {
        return API.get("CFF", "centers/" + this.state.center.id + "/forms", {}).then(e => {
            this.setState({"formList": e.res, "status": STATUS_FORM_LIST});
        }).catch(e => {
            this.setState({hasError: true});
        });
    }
    handleError(e) {
        this.setState({"hasError": true});
    }
    render() {
        var that = this;
        if (this.state.status == STATUS_LOADING) {
            return <Loading hasError={this.state.hasError} />;
        }
        return (
        <div className="App FormAdminPage">
            <h1>CCMT Form Admin - {this.state.center && this.state.center.name}</h1>
            <p>User id: {this.state.userId}</p>
        Change center:
        <select className="form-control" value={this.state.center.id} onChange={(e) => {
            let selectedCenter = find(this.state.centerList, {"id": parseInt(e.target.value)});
            this.setState({center: selectedCenter, status: STATUS_LOADING}, this.loadFormList);
        }}>
            {this.state.centerList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
            {this.state.status != STATUS_FORM_LIST && 
                <a href="#" onClick={() => {window.location.hash=""; this.loadFormList(); } }>Back to form list</a>
            }
            {this.state.status != STATUS_ACCESS_DENIED && this.state.formList && <FormList
                apiEndpoint={this.props.apiEndpoint}
                apiKey={this.state.apiKey}
                editForm = {(e) => this.editForm(e)}
                embedForm = {(e) => this.embedForm(e)}
                loadResponses= {(e) => this.loadResponses(e)} 
                loadResponseSummary = {(e) => this.loadResponseSummary(e)}
                formList = {this.state.status == STATUS_FORM_LIST ? this.state.formList : [this.state.selectedForm]} />}
            {this.state.status == STATUS_FORM_EMBED && 
                <FormEmbed form={this.state.selectedForm} apiEndpoint={this.props.apiEndpoint} />
            }
            {this.state.status == STATUS_FORM_EDIT && 
                <FormEdit form={this.state.selectedForm} apiEndpoint={this.props.apiEndpoint} apiKey={this.state.apiKey} />
            }
            {this.state.status == STATUS_FORM_RESPONSES &&
                <ResponseTable form={this.state.selectedForm} apiEndpoint={this.props.apiEndpoint} apiKey={this.state.apiKey}
                    handleError={(e) => this.handleError(e)} />
            }
            {this.state.status == STATUS_ACCESS_DENIED &&
                <div>
                    <h4><b>Access denied</b></h4>
                        <p>To finish setting up your account, please contact an administrator and give them your id:
                        <pre className="cff-copy-box">{this.state.userId}</pre>
                    </p>
                </div>
            }
        </div>
        );
    }
}

let FormAdminPage2 = () => <div>Done!</div>;
export default withAuthenticator(FormAdminPage, { includeGreetings: true });