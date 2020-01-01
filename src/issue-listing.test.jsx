import React from 'react';
import { mount } from 'enzyme';
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { act } from 'react-dom/test-utils';
import { clearStorage } from "react-simple-storage";

import Octokit from '@octokit/rest';
import nock from 'nock';

import IssueListing from './issue-listing';
import theme from './theme';
import SmallArrow from './components/small-arrow';

const mockStore = configureMockStore();
const store = mockStore({});

describe('IssueListing', () => {
	let selectedRepo;
	let issues;
	let apiKey = '1234567900';
	let wrapper;
	let scope;
	let octokit;

	beforeEach( () => {
		clearStorage();

	    selectedRepo = {
    		id: 332626,
    		name: 'example-repo',
    		created_at: "2009-10-09T22:32:41Z",
			updated_at: "2013-11-30T13:46:22Z",
			owner: {
				login: "liz"
			}
	    };

	    issues = [
	    	{ 
	    		assignee: {
		    		avatar_url: 'http://path/to/avatar.png',
		    		login: 'asignee-login'
		    	},
		    	title: "An issue title that is more than twenty-five characters, this issue was created more recently",
	    		created_at: "2017-10-09T22:32:41Z",
				updated_at: "2018-11-30T13:46:22Z"
			},
			{ 
		    	title: "B is a 25 character title",
	    		created_at: "2009-10-09T22:32:41Z",
				updated_at: "2010-11-30T13:46:22Z"
			},
			{ 
		    	title: "C has a zzzz login",
	    		created_at: "2005-10-09T22:32:41Z",
				updated_at: "2019-11-30T13:46:22Z",
				assignee: {
		    		avatar_url: 'http://path/to/zeeeavatar.png',
		    		login: 'ziggee-login'
		    	},
			}
	    ];
    });

    afterEach(() => {
		nock.cleanAll();
		jest.restoreAllMocks();
    });

    describe('componentDidUpdate', () => {
    	let fetchIssuesSpy;

    	beforeEach(() => {
    		fetchIssuesSpy = jest.spyOn(IssueListing.prototype, 'fetchIssues').mockImplementation();
			
			wrapper = mount(
				<Provider store={store}>
					<IssueListing selectedRepo={null} />
				</Provider>
			);

			wrapper.update();

			expect(wrapper.find('IssueListing').props().selectedRepo).toEqual(null);
	  		expect(wrapper.find('IssueListing').state().isLoaded).toEqual(null);

			wrapper.setProps({ children: <IssueListing selectedRepo={selectedRepo} /> });

	  		wrapper.update();
    	});

    	it('calls fetchIssues() on componentDidUpdate when selectedRepo prevProp is different then selectedRepo prop', () => {
			expect(wrapper.find('IssueListing').props().selectedRepo).toEqual(selectedRepo);
			expect(fetchIssuesSpy).toHaveBeenCalled();
	  	});

	  	it('sets isLoaded state to false componentDidUpdate when selectedRepo prevProp is different then selectedRepo prop', () => {
			expect(wrapper.find('IssueListing').state().isLoaded).toEqual(false);
			expect(fetchIssuesSpy).toHaveBeenCalled();
	  	});
    });

	describe('Renders', () => {
		it('should match the snapshot', () => {
			wrapper = mount(
				<Provider store={store}>
					<IssueListing selectedRepo={selectedRepo} />
				</Provider>
			);

			wrapper.update();

	    	expect(wrapper.html()).toMatchSnapshot();
	  	});

	  	it('renders NoRepoSelected when isLoaded state is null', () => {
	  		const fetchIssuesSpy = jest.spyOn(IssueListing.prototype, 'fetchIssues').mockImplementation();

			wrapper = mount(
				<Provider store={store}>
					<IssueListing selectedRepo={selectedRepo} />
				</Provider>
			);
			
			wrapper.update();

	    	expect(wrapper.find('IssueListing').state().isLoaded).toBe(null);
	    	expect(wrapper.find('IssueListing').find('NoRepoSelected')).toHaveLength(1);
	  	});

	  	it('renders LoadingSpinner when isLoaded state is false', () => {
	  		const fetchIssuesSpy = jest.spyOn(IssueListing.prototype, 'fetchIssues').mockImplementation();

			wrapper = mount(
				<Provider store={store}>
					<IssueListing selectedRepo={null} />
				</Provider>
			);

			wrapper.update();

			expect(wrapper.find('IssueListing').props().selectedRepo).toEqual(null);

			wrapper.setProps({ children: <IssueListing selectedRepo={selectedRepo} /> });
			
			wrapper.update();

	    	expect(wrapper.find('IssueListing').state().isLoaded).toBe(false);
	    	expect(wrapper.find('IssueListing').find('LoadingSpinner')).toHaveLength(1);
	  	});

	  	describe('Renders when github responds with github data', () => {
	  		beforeEach(async () => {
	  			nock.disableNetConnect();
			  	scope = nock('https://api.github.com')
			  	.persist()
			    .get(`/repos/${selectedRepo.owner.login}/${selectedRepo.name}/issues`)
			    .reply(200, issues);

				octokit = new Octokit({
		            auth: apiKey
		        });
				
				wrapper = mount(
					<Provider store={store}>
						<IssueListing selectedRepo={null} />
					</Provider>
				);

				wrapper.update();

				// console.log(wrapper.find('IssueListing').state())

				expect(wrapper.find('IssueListing').props().selectedRepo).toEqual(null);

				wrapper.setProps({ children: <IssueListing selectedRepo={selectedRepo} /> });

				// console.log("componentDidUpdate should have gone")

				// console.log(wrapper.find('IssueListing').state())

				await octokit.request(`/repos/${selectedRepo.owner.login}/${selectedRepo.name}/issues`);
				// console.log("fetch should have gone")
		  		scope.done();
		  		wrapper.update();

		  		// console.log(wrapper.find('IssueListing').state())

		  		expect(wrapper.find('IssueListing').props().selectedRepo).toEqual(selectedRepo);
		  		expect(wrapper.find('IssueListing').state().isLoaded).toBe(true);
		  		expect(wrapper.find('IssueListing').state().issues).toEqual(expect.arrayContaining(issues));
		  		// console.log(wrapper.find('IssueListing').state())
	  		});

  			afterEach(() => {
				nock.cleanAll();
			});

			it('renders repoName', () => {
		  		expect(wrapper.find('IssueListing').find('h2').text()).toEqual("Issues for example-repo");
			});

			describe('Renders table contents', () => {
				it('renders Table', () => {
			  		expect(wrapper.find('IssueListing').find('Table')).toHaveLength(1);
				});

				it('renders Asignee avatar Image when asignee is supplied', () => {
			  		expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('AssigneeCell').find('Image').props()).toEqual({
			  				src: issues[0].assignee.avatar_url,
			  				alt: issues[0].assignee.login,
			  				width: "40px",
			  				height: "40px",
			  				horizontalAlignment: "center",
			  				maxHeight: "100%",
			  				maxWidth: "100%",
			  				type: "tag",
			  				verticalAlignment: "center"
			  		});
				});

				it('renders Asignee avatar as "None" when asignee is not supplied', () => {
			  		expect(wrapper.find('IssueListing').find('Table').find('tr').at(2).find('AssigneeCell').find('Image')).toHaveLength(0);
			  		expect(wrapper.find('IssueListing').find('Table').find('tr').at(2).find('td').at(0).text()).toContain('None');
				});

				it('truncates title when a title longer then 25 characters is supplied', () => {
			  		expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('TitleCell').text()).toEqual(
			  			'An issue title that is...');
				});

				it('does not truncate title when a title is 25 characters or less', () => {
			  		expect(wrapper.find('IssueListing').find('Table').find('tr').at(2).find('TitleCell').text()).toEqual('B is a 25 character title');
				});

				it('renders created_at date in MM/DD/YYYY format', () => {
			  		expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
				});

				it('renders updated_at date in text format', () => {
			  		expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('UpdatedAtCell').text()).toEqual('a year ago');
				});
			});

			describe('Table sorting in mobile', () => {
				beforeEach(() => {
					global.innerWidth = 599;
			        global.dispatchEvent(new Event('resize'));
			        wrapper.update();
				});

				it('sorts table by created_at by default', () => {
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('created_at');
				});
				
				it('sorts table by desc direction by default', () => {
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
				});

				it('sorts table by avatar_url in decending order when "Assignee" option is selected in MobileSort', () => {
					wrapper.find('MobileSort').find('#sort-by').instance().value = 'avatar_url';
					wrapper.find('MobileSort').find('#sort-by').simulate('change');

					expect(wrapper.find('MobileSort').find('#sort-direction').props().value).toEqual('desc');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/avatar.png');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('AssigneeCell').text()).toEqual('None');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/zeeeavatar.png');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('avatar_url');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
				});

				it('sorts table by avatar_url in ascending order when "Asignee" and "Ascending" options are selected in MobileSort', () => {
					wrapper.find('MobileSort').find('#sort-by').instance().value = 'avatar_url';
					wrapper.find('MobileSort').find('#sort-by').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/avatar.png');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('AssigneeCell').text()).toEqual('None');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/zeeeavatar.png');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('avatar_url');
					expect(wrapper.find('MobileSort').find('#sort-direction').props().value).toEqual('desc');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');

					wrapper.find('MobileSort').find('#sort-direction').instance().value = 'asc';
					wrapper.find('MobileSort').find('#sort-direction').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/zeeeavatar.png');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('AssigneeCell').text()).toEqual('None');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/avatar.png');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('avatar_url');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
				});

				it('sorts table by title when "Title" option is selected in MobileSort', () => {
					wrapper.find('MobileSort').find('#sort-by').instance().value = 'title';
					wrapper.find('MobileSort').find('#sort-by').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('TitleCell').text()).toEqual('An issue title that is...');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('TitleCell').text()).toEqual('B is a 25 character title');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('TitleCell').text()).toEqual('C has a zzzz login');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('title');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
				});

				it('sorts table by title in ascending order when "Title" and "Ascending" options are selected in MobileSort', () => {
					wrapper.find('MobileSort').find('#sort-by').instance().value = 'title';
					wrapper.find('MobileSort').find('#sort-by').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('TitleCell').text()).toEqual('An issue title that is...');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('TitleCell').text()).toEqual('B is a 25 character title');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('TitleCell').text()).toEqual('C has a zzzz login');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('title');
					expect(wrapper.find('MobileSort').find('#sort-direction').props().value).toEqual('desc');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');

					wrapper.find('MobileSort').find('#sort-direction').instance().value = 'asc';
					wrapper.find('MobileSort').find('#sort-direction').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('TitleCell').text()).toEqual('C has a zzzz login');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('TitleCell').text()).toEqual('B is a 25 character title');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('TitleCell').text()).toEqual('An issue title that is...');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('title');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
				});

				it('sorts table by created_at when "Created Time" option is selected in MobileSort', () => {
					wrapper.find('MobileSort').find('#sort-by').instance().value = 'created_at';
					wrapper.find('MobileSort').find('#sort-by').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('CreatedAtCell').text()).toEqual('10/09/2009');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('CreatedAtCell').text()).toEqual('10/09/2005');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('created_at');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
				});

				it('sorts table by created_at in ascending order when "Created Time" and "Ascending" options are selected in MobileSort', () => {
					wrapper.find('MobileSort').find('#sort-by').instance().value = 'created_at';
					wrapper.find('MobileSort').find('#sort-by').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('CreatedAtCell').text()).toEqual('10/09/2009');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('CreatedAtCell').text()).toEqual('10/09/2005');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('created_at');
					expect(wrapper.find('MobileSort').find('#sort-direction').props().value).toEqual('desc');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');

					wrapper.find('MobileSort').find('#sort-direction').instance().value = 'asc';
					wrapper.find('MobileSort').find('#sort-direction').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2005');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('CreatedAtCell').text()).toEqual('10/09/2009');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('created_at');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
				});

				it('sorts table by updated_at in decending order when "Last updated" option is selected in MobileSort', () => {
					wrapper.find('MobileSort').find('#sort-by').instance().value = 'updated_at';
					wrapper.find('MobileSort').find('#sort-by').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('UpdatedAtCell').text()).toEqual('a month ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('UpdatedAtCell').text()).toEqual('a year ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('UpdatedAtCell').text()).toEqual('9 years ago');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('updated_at');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
				});

				it('sorts table by updated_at in ascending order when "Last Updated" and "Ascending" options are selected in MobileSort', () => {
					wrapper.find('MobileSort').find('#sort-by').instance().value = 'updated_at';
					wrapper.find('MobileSort').find('#sort-by').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('UpdatedAtCell').text()).toEqual('a month ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('UpdatedAtCell').text()).toEqual('a year ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('UpdatedAtCell').text()).toEqual('9 years ago');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('updated_at');
					expect(wrapper.find('MobileSort').find('#sort-direction').props().value).toEqual('desc');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');

					wrapper.find('MobileSort').find('#sort-direction').instance().value = 'asc';
					wrapper.find('MobileSort').find('#sort-direction').simulate('change');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('UpdatedAtCell').text()).toEqual('9 years ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('UpdatedAtCell').text()).toEqual('a year ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('UpdatedAtCell').text()).toEqual('a month ago');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('updated_at');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
				});

				// it('sorts table by updated_at and reverses sort order when UpdatedAtButton is clicked twice in a row in desktop', () => {
				// 	wrapper.find('IssueListing').find('Table').find('UpdatedAtButton').simulate('click');
				// 	wrapper.find('IssueListing').find('Table').find('UpdatedAtButton').simulate('click');

				// 	expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('UpdatedAtCell').text()).toEqual('9 years ago');
				// 	expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('UpdatedAtCell').text()).toEqual('a year ago');
				// 	expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('UpdatedAtCell').text()).toEqual('a month ago');
				// 	expect(wrapper.find('IssueListing').state().sort.column).toEqual('updated_at');
				// });
			});

			describe('Table sorting in desktop', () => {
				beforeEach(() => {
					global.innerWidth = 1024;
			        global.dispatchEvent(new Event('resize'));
			        wrapper.update();

				});

				it('sorts table by created_at by default', () => {
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('created_at');
				});
				
				it('sorts table by desc direction by default', () => {
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
				});

				it('sorts table by avatar_url and sets sort direction to desc when AssigneeButton is clicked in desktop', () => {
					wrapper.find('IssueListing').find('Table').find('AssigneeButton').simulate('click');

					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/avatar.png');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('AssigneeCell').text()).toEqual('None');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/zeeeavatar.png');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('avatar_url');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
					
				});

				it('sorts table by avatar_url and and sets sort direction to asc when AssigneeButton is clicked twice in a row in desktop', () => {
					wrapper.find('IssueListing').find('Table').find('AssigneeButton').simulate('click');
					wrapper.find('IssueListing').find('Table').find('AssigneeButton').simulate('click');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/zeeeavatar.png');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('AssigneeCell').text()).toEqual('None');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('AssigneeCell').find('Image').props().src).toEqual('http://path/to/avatar.png');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('avatar_url');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
				});

				it('sorts table by title and sets sort direction to desc when TitleButton is clicked in desktop', () => {
					wrapper.find('IssueListing').find('Table').find('TitleButton').simulate('click');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('TitleCell').text()).toEqual('An issue title that is...');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('TitleCell').text()).toEqual('B is a 25 character title');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('TitleCell').text()).toEqual('C has a zzzz login');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('title');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
				});

				it('sorts table by title and sets sort direction to asc when TitleButton is clicked in a row on desktop', () => {
					wrapper.find('IssueListing').find('Table').find('TitleButton').simulate('click');
					wrapper.find('IssueListing').find('Table').find('TitleButton').simulate('click');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('TitleCell').text()).toEqual('C has a zzzz login');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('TitleCell').text()).toEqual('B is a 25 character title');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('TitleCell').text()).toEqual('An issue title that is...');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('title');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
				});

				it('sorts table by created_at and sets sort direction to asc when CreatedAtButton is clicked in desktop (since it is ordered by desc on load)', () => {
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('CreatedAtCell').text()).toEqual('10/09/2009');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('CreatedAtCell').text()).toEqual('10/09/2005');

					wrapper.find('IssueListing').find('Table').find('CreatedAtButton').simulate('click');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2005');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('CreatedAtCell').text()).toEqual('10/09/2009');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('created_at'); 
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
				});

				it('sorts table by created_at and and sets sort direction to desc when CreatedAtButton is clicked twice in a row in desktop (since it is ordered by desc on load)', () => {
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');

					wrapper.find('IssueListing').find('Table').find('CreatedAtButton').simulate('click');

					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2005');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('CreatedAtCell').text()).toEqual('10/09/2009');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('created_at'); 

					wrapper.find('IssueListing').find('Table').find('CreatedAtButton').simulate('click');

					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('CreatedAtCell').text()).toEqual('10/09/2017');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('CreatedAtCell').text()).toEqual('10/09/2009');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('CreatedAtCell').text()).toEqual('10/09/2005');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('created_at');

				});

				it('sorts table by updated_at and sets sort direction to desc when UpdatedAtButton is clicked in desktop', () => {
					wrapper.find('IssueListing').find('Table').find('UpdatedAtButton').simulate('click');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('UpdatedAtCell').text()).toEqual('a month ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('UpdatedAtCell').text()).toEqual('a year ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('UpdatedAtCell').text()).toEqual('9 years ago');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('updated_at');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('desc');
				});

				it('sorts table by updated_at and and sets sort direction to asc when UpdatedAtButton is clicked twice in a row in desktop', () => {
					wrapper.find('IssueListing').find('Table').find('UpdatedAtButton').simulate('click');
					wrapper.find('IssueListing').find('Table').find('UpdatedAtButton').simulate('click');

					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(0).find('UpdatedAtCell').text()).toEqual('9 years ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(1).find('UpdatedAtCell').text()).toEqual('a year ago');
					expect(wrapper.find('IssueListing').find('Table').find('tbody').find('tr').at(2).find('UpdatedAtCell').text()).toEqual('a month ago');
					expect(wrapper.find('IssueListing').state().sort.column).toEqual('updated_at');
					expect(wrapper.find('IssueListing').state().sort.direction).toEqual('asc');
				});
			});
		});

		it('renders NoIssuesMessage  when github API responds with an error', async () => {
			nock.cleanAll();
			nock.disableNetConnect();
		  	scope = nock('https://api.github.com')
		  	.persist()
		    .get(`/repos/${selectedRepo.owner.login}/${selectedRepo.name}/issues`)
		    .reply(404, {
			  "message": "Not Found",
			  "documentation_url": "https://developer.github.com/v3/issues/#list-issues-for-a-repository"
			});

		   	octokit = new Octokit({
		   		auth: apiKey
		   	});

			wrapper = mount(
				<Provider store={store}>
					<IssueListing selectedRepo={null} />
				</Provider>
			);

			wrapper.update();

			expect(wrapper.find('IssueListing').props().selectedRepo).toEqual(null);

			wrapper.setProps({ children: <IssueListing selectedRepo={selectedRepo} /> });

			try {
				await octokit.request(`/repos/${selectedRepo.owner.login}/${selectedRepo.name}/issues`);
				scope.done();
			} catch (e) {
				expect(e.status).toEqual(404);
			}

			wrapper.update();

		  	expect(wrapper.find('IssueListing').state().isLoaded).toBe(true);
		  	expect(wrapper.find('IssueListing').state().issues).toEqual([]);
		  	expect(wrapper.find('IssueListing').find('NoIssuesMessage')).toHaveLength(1);
		  	nock.cleanAll();
		});
	});
});