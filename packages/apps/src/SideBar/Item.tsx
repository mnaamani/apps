// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import { Route } from '../types';

import React from 'react';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Icon, Menu } from '@polkadot/ui-app/index';
import accountObservable from '@polkadot/ui-keyring/observable/accounts';
import { withApi, withMulti, withObservable } from '@polkadot/ui-api/index';
import { isFunction } from '@polkadot/util';

type Props = I18nProps & ApiProps & {
  allAccounts?: SubjectInfo,
  route: Route
};

class Item extends React.PureComponent<Props> {
  render () {
    const { route: { i18n, icon, name }, t } = this.props;

    if (!this.isVisible()) {
      return null;
    }

    return (
      <Menu.Item className='apps--SideBar-Item'>
        <NavLink
          activeClassName='apps--SideBar-Item-NavLink-active'
          className='apps--SideBar-Item-NavLink'
          to={`/${name}`}
        >
          <Icon name={icon} /><span className='text'>{t(`sidebar.${name}`, i18n)}</span>
        </NavLink>
      </Menu.Item>
    );
  }

  private isVisible () {
    const { allAccounts = {}, api, isApiConnected, isApiReady, route: { display: { isHidden, needsAccounts, needsApi }, name } } = this.props;
    const hasAccounts = Object.keys(allAccounts).length !== 0;

    if (isHidden) {
      return false;
    } else if (needsAccounts && !hasAccounts) {
      return false;
    } else if (!needsApi) {
      return true;
    } else if (!isApiReady || !isApiConnected) {
      return false;
    }

    const notFound = needsApi.filter((endpoint: string) => {
      const [area, section, method] = endpoint.split('.');

      try {
        return !isFunction((api as any)[area][section][method]);
      } catch (error) {
        return true;
      }
    });

    if (notFound.length !== 0) {
      console.error(`Disabling route ${name}, API ${notFound} not available`);
    }

    return notFound.length === 0;
  }
}

export default withMulti(
  Item,
  withRouter,
  withApi,
  withObservable(accountObservable.subject, { propName: 'allAccounts' })
);
